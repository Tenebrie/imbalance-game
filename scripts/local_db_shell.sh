#!/bin/bash

docker exec -it $(docker ps -aqf "name=dev-db") psql -Udocker db
