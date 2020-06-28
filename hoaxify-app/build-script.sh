#!/bin/bash
docker build -t manhnd695/hoaxify-app:latest .
echo "build successfully"
docker push manhnd695/hoaxify-app:latest
echo "push successfully"

