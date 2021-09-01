#!/bin/bash

docker context use default
docker build .. -f Dockerfile -t tenebrie/imbalance-server
docker image push tenebrie/imbalance-server
docker context use imbalance-testing
docker compose --file docker-compose-aws.yml up

docker context use default
