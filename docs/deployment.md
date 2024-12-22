Install docker
sudo yum install docker -y

Install docker compose

sudo rm /usr/local/bin/docker-compose
curl -SL https://github.com/docker/compose/releases/download/v2.32.0/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

Install Kind on the EC2 Instance
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.26.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

Install Kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

To Test: kubectl version --client

start docker
sudo systemctl start docker

create cluster
kind create cluster izistore-backend-microservices
