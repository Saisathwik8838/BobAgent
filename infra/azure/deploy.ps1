<#
.SYNOPSIS
    One-click deployment script for BobAgent on Azure Container Apps.
.DESCRIPTION
    Provisions Azure Resource Group, Bicep infrastructure (Log Analytics, ACR, ACA Environment,
    PostgreSQL with pgvector, Redis, Ollama), builds Docker images, pushes to ACR, and deploys.
.PARAMETER ResourceGroup
    Name of the Azure Resource Group (default: rg-bobagent-prod)
.PARAMETER Location
    Azure Region (default: eastus)
.PARAMETER SubscriptionId
    Optional Azure Subscription ID
#>

param(
    [string]$ResourceGroup = "rg-bobagent-prod",
    [string]$Location = "eastus",
    [string]$SubscriptionId = ""
)

$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🚀 BobAgent Azure Container Apps Deployer" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Verify Azure CLI is installed
if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Error "Azure CLI (az) is not installed. Please install it from https://aka.ms/installazurecliwindows and run 'az login'."
}

# 2. Check Azure Login
Write-Host "`n[1/6] Checking Azure authentication..." -ForegroundColor Yellow
$account = az account show 2>$null | ConvertFrom-Json
if (-not $account) {
    Write-Host "Not logged in. Initiating 'az login'..." -ForegroundColor Yellow
    az login
    $account = az account show | ConvertFrom-Json
}
Write-Host "Logged in to subscription: $($account.name) ($($account.id))" -ForegroundColor Green

if ($SubscriptionId) {
    Write-Host "Setting subscription to $SubscriptionId..." -ForegroundColor Yellow
    az account set --subscription $SubscriptionId
}

# 3. Create Resource Group
Write-Host "`n[2/6] Ensuring Resource Group '$ResourceGroup' in '$Location'..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location | Out-Null
Write-Host "Resource group verified." -ForegroundColor Green

# 4. Deploy Bicep Infrastructure
Write-Host "`n[3/6] Deploying infrastructure via Bicep (infra/azure/main.bicep)..." -ForegroundColor Yellow
$bicepOutput = az deployment group create `
    --resource-group $ResourceGroup `
    --template-file ./infra/azure/main.bicep `
    --parameters ./infra/azure/parameters.json `
    --query properties.outputs | ConvertFrom-Json

$acrServer = $bicepOutput.acrLoginServer.value
$acrName = $bicepOutput.acrName.value
$frontendUrl = $bicepOutput.frontendUrl.value
$backendUrl = $bicepOutput.backendUrl.value

Write-Host "Infrastructure provisioned successfully!" -ForegroundColor Green
Write-Host "ACR Login Server: $acrServer" -ForegroundColor Cyan

# 5. Build and Push Docker Images
Write-Host "`n[4/6] Logging in to Azure Container Registry ($acrName)..." -ForegroundColor Yellow
az acr login --name $acrName

Write-Host "`n[5/6] Building and pushing Docker container images..." -ForegroundColor Yellow
$gitHash = git rev-parse --short HEAD 2>$null
if (-not $gitHash) { $gitHash = "v1" }

Write-Host "Building backend image ($acrServer/bobagent-backend:$gitHash)..."
docker build -t "$acrServer/bobagent-backend:latest" -t "$acrServer/bobagent-backend:$gitHash" -f Dockerfile.backend .
docker push "$acrServer/bobagent-backend:latest"
docker push "$acrServer/bobagent-backend:$gitHash"

Write-Host "Building frontend image ($acrServer/bobagent-frontend:$gitHash)..."
docker build -t "$acrServer/bobagent-frontend:latest" -t "$acrServer/bobagent-frontend:$gitHash" -f Dockerfile.frontend .
docker push "$acrServer/bobagent-frontend:latest"
docker push "$acrServer/bobagent-frontend:$gitHash"

# 6. Update Container Apps
Write-Host "`n[6/6] Updating Container Apps with newly built images..." -ForegroundColor Yellow
az containerapp update --name bobagent-backend --resource-group $ResourceGroup --image "$acrServer/bobagent-backend:$gitHash" | Out-Null
az containerapp update --name bobagent-frontend --resource-group $ResourceGroup --image "$acrServer/bobagent-frontend:$gitHash" | Out-Null

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "✅ BobAgent Successfully Deployed to Azure Container Apps!" -ForegroundColor Green
Write-Host "Frontend URL: $frontendUrl" -ForegroundColor Cyan
Write-Host "Backend URL:  $backendUrl" -ForegroundColor Cyan
Write-Host "API Swagger:  $backendUrl/docs" -ForegroundColor Cyan
Write-Host "Health Check: $backendUrl/api/v1/health" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Green
