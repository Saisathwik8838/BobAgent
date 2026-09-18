#!/bin/bash
set -e

echo "=========================================================="
echo "🚀 BobAgent Azure VM Automated Setup & Deployment"
echo "=========================================================="

# 1. Update and install Docker & Git if not already installed
if ! command -v docker &> /dev/null; then
    echo "--> Installing Docker Engine and Docker Compose..."
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg git
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker $USER
fi

# 2. Clone or pull repository
REPO_DIR="$HOME/BobAgent"
if [ -d "$REPO_DIR" ]; then
    echo "--> Updating existing repository at $REPO_DIR..."
    cd "$REPO_DIR"
    git pull origin main
else
    echo "--> Cloning BobAgent repository..."
    git clone https://github.com/Saisathwik8838/BobAgent.git "$REPO_DIR"
    cd "$REPO_DIR"
fi

# 3. Launch Docker Compose stack
echo "--> Building and starting Docker containers (PostgreSQL, Redis, Ollama, Backend, Frontend)..."
sudo docker compose -f docker-compose.prod.yml up -d --build

# 4. Wait for Ollama service to start and pull llama3:latest
echo "--> Pulling llama3:latest into containerized Ollama (this runs inside the VM)..."
until sudo docker exec bobagent-ollama ollama list &>/dev/null; do
    echo "Waiting for Ollama container to be ready..."
    sleep 3
done
sudo docker exec bobagent-ollama ollama pull llama3:latest

# 5. Run Database Migrations
echo "--> Running Alembic database migrations in backend container..."
sleep 5
sudo docker exec bobagent-backend alembic upgrade head

# 6. Success Output
PUBLIC_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || echo "<YOUR_VM_PUBLIC_IP>")
echo ""
echo "=========================================================="
echo "✅ BobAgent is LIVE on your Azure VM!"
echo "=========================================================="
echo "Frontend Application:  http://${PUBLIC_IP}"
echo "Backend API Docs:      http://${PUBLIC_IP}:8000/docs"
echo "Health Check:          http://${PUBLIC_IP}:8000/api/v1/health"
echo "=========================================================="
