#!/bin/bash

docker exec -it $(docker ps -aqf "name=notgwent-game_dev-db") psql -Udocker db -c "SELECT pg_size_pretty(pg_database_size('db')) as \"Database size\";"
