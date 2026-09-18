<#
.SYNOPSIS
    Connect and deploy BobAgent to an Azure Linux VM.
.DESCRIPTION
    Fixes Windows permissions on your Azure .pem key, SSHs into the Azure VM,
    and optionally executes the full automated setup.
.PARAMETER PemPath
    Full or relative path to your downloaded .pem private key file.
.PARAMETER VmIp
    Public IP address of your Azure Virtual Machine.
.PARAMETER User
    Admin username chosen during VM creation (default: azureuser).
.PARAMETER Deploy
    Switch to automatically execute the full deployment on the remote VM.
.EXAMPLE
    .\infra\azure\connect-vm.ps1 -PemPath "C:\Users\saisa\Downloads\myKey.pem" -VmIp "20.120.45.67" -Deploy
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$PemPath,

    [Parameter(Mandatory=$true)]
    [string]$VmIp,

    [string]$User = "azureuser",

    [switch]$Deploy
)

# 1. Clean and validate VM IP
$VmIp = $VmIp.Trim().Trim('<', '>').Trim()
Write-Host "Target VM IP: $VmIp" -ForegroundColor Cyan

# 2. Resolve PEM path
$resolvedPem = Resolve-Path $PemPath -ErrorAction Stop
Write-Host "Using SSH Key: $resolvedPem" -ForegroundColor Cyan

# 2. Fix Windows permissions on .pem file (prevents 'Permissions are too open' error)
Write-Host "Configuring secure file permissions on .pem key..." -ForegroundColor Yellow
icacls.exe $resolvedPem /inheritance:r | Out-Null
icacls.exe $resolvedPem /grant:r "$($env:USERNAME):(R)" | Out-Null
Write-Host "File permissions secured successfully." -ForegroundColor Green

# 3. Deploy or Interactive SSH
if ($Deploy) {
    Write-Host "`nConnecting to $User@$VmIp and launching automated BobAgent deployment..." -ForegroundColor Cyan
    ssh -o StrictHostKeyChecking=no -i $resolvedPem "$User@$VmIp" "curl -fsSL https://raw.githubusercontent.com/Saisathwik8838/BobAgent/main/infra/azure/vm-setup.sh | bash"
} else {
    Write-Host "`nConnecting to $User@$VmIp via SSH..." -ForegroundColor Cyan
    ssh -o StrictHostKeyChecking=no -i $resolvedPem "$User@$VmIp"
}
