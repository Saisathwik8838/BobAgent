# Deployment Guide: BobAgent on Azure Container Apps

This guide details the production deployment of **BobAgent** to **Azure Container Apps (ACA)** with **Infrastructure as Code (Bicep)**, containerized **PostgreSQL with pgvector**, **Redis**, containerized **Ollama (`llama3:latest`)**, and automated **GitHub Actions CI/CD**.

---

## 1. Cloud Architecture Overview

```
                      [ Internet / User Browser ]
                                   │
                                   ▼ HTTPS (Port 443/80)
                     ┌───────────────────────────┐
                     │     bobagent-frontend     │ (React SPA on Nginx)
                     │ (Azure Container App)     │
                     └─────────────┬─────────────┘
                                   │ /api/ proxy
                                   ▼ HTTP (Port 8000)
                     ┌───────────────────────────┐
                     │     bobagent-backend      │ (FastAPI + LangGraph)
                     │ (Azure Container App)     │
                     └──────┬───────────┬────────┘
                            │           │
             Internal TCP   │           │ Internal HTTP
             (Port 5432)    ▼           ▼ (Port 11434)
      ┌───────────────────────┐       ┌───────────────────────┐
      │   bobagent-postgres   │       │    bobagent-ollama    │
      │ (pgvector / pg16)     │       │   (llama3:latest)     │
      └───────────────────────┘       └───────────────────────┘
                            │
             Internal TCP   │
             (Port 6379)    ▼
      ┌───────────────────────┐
      │     bobagent-redis    │
      │    (Redis 7 Alpine)   │
      └───────────────────────┘
```

* **Zero External API Cost**: All LLM inference runs inside the dedicated `bobagent-ollama` Container App running `llama3:latest`.
* **Zero Fabrication Grounding**: `bobagent-postgres` provides isolated pgvector storage with cosine distance retrieval for candidate ground truth.
* **Continuous Delivery**: Every push to the `main` branch automatically builds container images and deploys revisions to Azure.

---

## 2. Prerequisites

1. An active [Azure Subscription](https://azure.microsoft.com/free/).
2. [Azure CLI (`az`)](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) installed locally (if triggering deployment manually).
3. Admin access to your GitHub repository ([Saisathwik8838/BobAgent](https://github.com/Saisathwik8838/BobAgent)).

---

## 3. GitHub Actions CI/CD Deployment Setup (Recommended)

### Step 1: Create an Azure Service Principal

Run the following command in your local terminal or [Azure Cloud Shell](https://shell.azure.com):

```bash
# Get your Azure Subscription ID
SUBSCRIPTION_ID=$(az account show --query id -o tsv)

# Create the Service Principal with Contributor access
az ad sp create-for-rbac \
  --name "sp-bobagent-github" \
  --role "Contributor" \
  --scopes "/subscriptions/$SUBSCRIPTION_ID" \
  --sdk-auth
```

This will output a JSON credentials block like this:

```json
{
  "clientId": "<client-id>",
  "clientSecret": "<client-secret>",
  "subscriptionId": "<subscription-id>",
  "tenantId": "<tenant-id>",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

### Step 2: Configure GitHub Repository Secrets

1. Navigate to your repository on GitHub: **`https://github.com/Saisathwik8838/BobAgent/settings/secrets/actions`**
2. Click **New repository secret** and add the following two secrets:

| Secret Name | Value | Purpose |
| :--- | :--- | :--- |
| `AZURE_CREDENTIALS` | The entire JSON output block from Step 1 | Authenticates GitHub Actions to Azure |
| `AZURE_SUBSCRIPTION_ID` | Your Azure Subscription ID GUID | Targets the deployment subscription |

### Step 3: Trigger the Automated Deployment

Once the secrets are configured, you can trigger the deployment in either of two ways:

1. **Automatic on Push**: Push any commit touching `backend/`, `frontend/`, `infra/`, or `Dockerfile.*` to the `main` branch.
2. **Manual Dispatch**: Go to the **Actions** tab on GitHub, select **Deploy BobAgent to Azure Container Apps**, and click **Run workflow**.

The workflow will:
1. Provision the Azure Resource Group (`rg-bobagent-prod`).
2. Deploy the Bicep template (`infra/azure/main.bicep`).
3. Build and push the backend and frontend container images to Azure Container Registry.
4. Update the Azure Container Apps with zero downtime.
5. Print the live production URLs in the workflow summary.

---

## 4. Local One-Click Deployment (PowerShell)

If you prefer to deploy directly from your machine using PowerShell:

```powershell
# 1. Login to Azure
az login

# 2. Run the deployment script
.\infra\azure\deploy.ps1 -ResourceGroup "rg-bobagent-prod" -Location "eastus"
```

---

## 5. Verifying the Deployment

Once the deployment finishes, verify each service:

1. **Frontend**: Open `https://<frontend-fqdn>` in your browser. Verify navigation across Dashboard, Profile, RAG, Jobs, Applications, Agents, Interview, and Eval.
2. **Backend Health Check**:
   ```bash
   curl -s https://<backend-fqdn>/api/v1/health | jq
   ```
   Expected response:
   ```json
   {
     "status": "healthy",
     "app_name": "BobAgent",
     "environment": "production",
     "llm_provider": "ollama",
     "embedding_provider": "mock"
   }
   ```
3. **Interactive API Documentation**: Open `https://<backend-fqdn>/docs` for the interactive Swagger UI.

---

## 6. Managing & Monitoring

* **View Container Logs**:
  ```bash
  az containerapp logs show \
    --name bobagent-backend \
    --resource-group rg-bobagent-prod \
    --follow
  ```
* **Log Analytics Queries**: Open Azure Portal -> Resource Group `rg-bobagent-prod` -> `bobagent-prod-logs` -> Run KQL queries on `ContainerAppConsoleLogs_CL`.
