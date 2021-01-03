#!/bin/bash

docker exec -it $(docker ps -aqf "name=notgwent-game_dev-db") psql -Udocker db
