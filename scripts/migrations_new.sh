#!/bin/bash

(cd "$(dirname "$0")" && cd ../server && npx node-pg-migrate create "$@")
