#!/bin/bash

docker exec -it $(docker ps -aqf "name=gaia") bash
