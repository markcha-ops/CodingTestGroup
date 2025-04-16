#!/bin/bash

# This script helps manage Docker containers within the Docker container

function create_container() {
    local name=$1
    local image=$2
    local ports=$3
    local envs=$4
    
    # Build docker run command
    cmd="docker run -d --name $name"
    
    # Add port mappings if provided
    if [ ! -z "$ports" ]; then
        IFS=',' read -ra PORT_ARRAY <<< "$ports"
        for port in "${PORT_ARRAY[@]}"; do
            cmd="$cmd -p $port"
        done
    fi
    
    # Add environment variables if provided
    if [ ! -z "$envs" ]; then
        IFS=',' read -ra ENV_ARRAY <<< "$envs"
        for env in "${ENV_ARRAY[@]}"; do
            cmd="$cmd -e $env"
        done
    fi
    
    # Add the image name to the command
    cmd="$cmd $image"
    
    # Run the command
    echo "Executing: $cmd"
    eval $cmd
}

function stop_container() {
    local name=$1
    docker stop $name
}

function remove_container() {
    local name=$1
    docker rm $name
}

function list_containers() {
    docker ps -a
}

# Parse command line arguments
command=$1
shift

case $command in
    create)
        create_container "$@"
        ;;
    stop)
        stop_container "$@"
        ;;
    remove)
        remove_container "$@"
        ;;
    list)
        list_containers
        ;;
    *)
        echo "Usage: $0 {create|stop|remove|list} [arguments]"
        echo "Examples:"
        echo "  $0 create my-container nginx 8080:80 \"VAR1=value1,VAR2=value2\""
        echo "  $0 stop my-container"
        echo "  $0 remove my-container"
        echo "  $0 list"
        exit 1
        ;;
esac

exit 0 