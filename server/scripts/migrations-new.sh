#!/bin/bash

(cd "$(dirname "$0")" && cd .. && npx node-pg-migrate create "$@")
