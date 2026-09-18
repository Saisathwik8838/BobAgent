@description('Base name for all resources')
param appName string = 'bobagent'

@description('Deployment region for resources')
param location string = resourceGroup().location

@description('Environment name for tags and suffixes (e.g. prod, staging)')
param environment string = 'prod'

@description('Unique suffix for globally unique names like ACR')
param uniqueSuffix string = uniqueString(resourceGroup().id)

@description('Secret key for JWT token encoding in FastAPI')
@secure()
param secretKey string = newGuid()

@description('Postgres DB Password')
@secure()
param dbPassword string = 'BobAgentSecurePass2026!'

@description('Ollama model to use for inferences')
param ollamaModel string = 'llama3:latest'

// Resource Names
var acrName = '${replace(appName, '-', '')}${uniqueSuffix}'
var logWorkspaceName = '${appName}-${environment}-logs'
var containerAppEnvName = '${appName}-${environment}-cae'
var pgName = '${appName}-postgres'
var redisName = '${appName}-redis'
var ollamaName = '${appName}-ollama'
var backendName = '${appName}-backend'
var frontendName = '${appName}-frontend'

// 1. Log Analytics Workspace
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logWorkspaceName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// 2. Azure Container Registry
resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}

// 3. Azure Container Apps Managed Environment
resource containerAppEnv 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: containerAppEnvName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

// 4. PostgreSQL + pgvector Container App (Internal service)
resource postgresApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: pgName
  location: location
  properties: {
    managedEnvironmentId: containerAppEnv.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: false
        targetPort: 5432
        transport: 'tcp'
      }
    }
    template: {
      containers: [
        {
          name: 'postgres'
          image: 'pgvector/pgvector:pg16'
          resources: {
            cpu: json('1.0')
            memory: '2Gi'
          }
          env: [
            {
              name: 'POSTGRES_DB'
              value: 'bobagent'
            }
            {
              name: 'POSTGRES_USER'
              value: 'postgres'
            }
            {
              name: 'POSTGRES_PASSWORD'
              value: dbPassword
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 1
      }
    }
  }
}

// 5. Redis Container App (Internal service)
resource redisApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: redisName
  location: location
  properties: {
    managedEnvironmentId: containerAppEnv.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: false
        targetPort: 6379
        transport: 'tcp'
      }
    }
    template: {
      containers: [
        {
          name: 'redis'
          image: 'redis:7-alpine'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 1
      }
    }
  }
}

// 6. Ollama Container App (Internal service)
resource ollamaApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: ollamaName
  location: location
  properties: {
    managedEnvironmentId: containerAppEnv.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: false
        targetPort: 11434
        transport: 'http'
      }
    }
    template: {
      containers: [
        {
          name: 'ollama'
          image: 'ollama/ollama:latest'
          resources: {
            cpu: json('2.0')
            memory: '4Gi'
          }
          command: [
            '/bin/sh'
            '-c'
            'ollama serve & sleep 5 && ollama pull ${ollamaModel} && wait'
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 1
      }
    }
  }
}

// 7. Backend Container App (FastAPI)
resource backendApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: backendName
  location: location
  properties: {
    managedEnvironmentId: containerAppEnv.id
    configuration: {
      activeRevisionsMode: 'Single'
      registries: [
        {
          server: acr.properties.loginServer
          username: acr.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        {
          name: 'acr-password'
          value: acr.listCredentials().passwords[0].value
        }
        {
          name: 'secret-key'
          value: secretKey
        }
        {
          name: 'db-password'
          value: dbPassword
        }
      ]
      ingress: {
        external: true
        targetPort: 8000
        transport: 'http'
        corsPolicy: {
          allowedOrigins: [
            '*'
          ]
          allowedMethods: [
            'GET'
            'POST'
            'PUT'
            'DELETE'
            'PATCH'
            'OPTIONS'
          ]
          allowedHeaders: [
            '*'
          ]
        }
      }
    }
    template: {
      containers: [
        {
          name: 'backend'
          image: '${acr.properties.loginServer}/bobagent-backend:latest'
          resources: {
            cpu: json('1.0')
            memory: '2Gi'
          }
          env: [
            {
              name: 'APP_NAME'
              value: 'BobAgent'
            }
            {
              name: 'ENVIRONMENT'
              value: 'production'
            }
            {
              name: 'DEBUG'
              value: 'false'
            }
            {
              name: 'SECRET_KEY'
              secretRef: 'secret-key'
            }
            {
              name: 'DATABASE_URL'
              value: 'postgresql+asyncpg://postgres:${dbPassword}@${pgName}:5432/bobagent'
            }
            {
              name: 'SYNC_DATABASE_URL'
              value: 'postgresql+psycopg://postgres:${dbPassword}@${pgName}:5432/bobagent'
            }
            {
              name: 'REDIS_URL'
              value: 'redis://${redisName}:6379/0'
            }
            {
              name: 'LLM_PROVIDER'
              value: 'ollama'
            }
            {
              name: 'OLLAMA_BASE_URL'
              value: 'http://${ollamaName}:11434'
            }
            {
              name: 'OLLAMA_MODEL'
              value: ollamaModel
            }
            {
              name: 'EMBEDDING_PROVIDER'
              value: 'mock'
            }
            {
              name: 'EMBEDDING_DIMENSIONS'
              value: '1536'
            }
            {
              name: 'GROUNDEDNESS_THRESHOLD'
              value: '0.75'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
}

// 8. Frontend Container App (React SPA Nginx)
resource frontendApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: frontendName
  location: location
  properties: {
    managedEnvironmentId: containerAppEnv.id
    configuration: {
      activeRevisionsMode: 'Single'
      registries: [
        {
          server: acr.properties.loginServer
          username: acr.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        {
          name: 'acr-password'
          value: acr.listCredentials().passwords[0].value
        }
      ]
      ingress: {
        external: true
        targetPort: 80
        transport: 'http'
      }
    }
    template: {
      containers: [
        {
          name: 'frontend'
          image: '${acr.properties.loginServer}/bobagent-frontend:latest'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            {
              name: 'VITE_API_BASE_URL'
              value: 'https://${backendApp.properties.configuration.ingress.fqdn}/api/v1'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 2
      }
    }
  }
}

// Outputs
output acrLoginServer string = acr.properties.loginServer
output acrName string = acr.name
output backendFqdn string = backendApp.properties.configuration.ingress.fqdn
output frontendFqdn string = frontendApp.properties.configuration.ingress.fqdn
output frontendUrl string = 'https://${frontendApp.properties.configuration.ingress.fqdn}'
output backendUrl string = 'https://${backendApp.properties.configuration.ingress.fqdn}'
