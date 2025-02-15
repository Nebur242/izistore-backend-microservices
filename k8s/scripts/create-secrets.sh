#!/bin/bash

# Function to read .env file and create a string of key-value pairs for kubectl
parse_env_file() {
    local env_file=$1
    local args=""
    
    if [ -f "$env_file" ]; then
        while IFS='=' read -r key value || [ -n "$key" ]; do
            # Skip empty lines and comments
            if [ -z "$key" ] || [[ $key == \#* ]]; then
                continue
            fi
            # Remove any quotes from the value
            value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
            args="$args --from-literal=$key=$value"
        done < "$env_file"
    else
        echo "Warning: $env_file not found"
    fi
    
    echo "$args"
}

# Create namespace if it doesn't exist
create_namespace() {
    local namespace=$1
    if ! kubectl get namespace "$namespace" > /dev/null 2>&1; then
        kubectl create namespace "$namespace"
        echo "Created namespace: $namespace"
    fi
}

# Main script
ENVIRONMENTS=("dev" "prod")
SERVICES=("api-gateway" "auth-service")

for env in "${ENVIRONMENTS[@]}"; do
    # Create namespace
    create_namespace "$env"
    
    # Initialize the secret creation command
    secret_command="kubectl create secret generic app-secrets -n $env"
    
    # Add environment variables from each service
    for service in "${SERVICES[@]}"; do
        env_file="../../apps/$service/.env.$env"
        env_args=$(parse_env_file "$env_file")
        if [ ! -z "$env_args" ]; then
            secret_command="$secret_command $env_args"
        fi
    done
    
    # Execute the secret creation command
    echo "Creating secrets for $env environment..."
    eval "$secret_command --dry-run=client -o yaml | kubectl apply -f -"
done

echo "Secrets created successfully!"