#!/bin/bash

cd "${0%/*}"

CLIENT='\033[0;32m'
SERVER='\033[0;33m'
SHARED='\033[0;34m'
TOTAL='\033[0;35m'

NC='\033[0m'

echo -e "${CLIENT} [[Client]]"
npx cloc ../client/src
echo -e "${NC}"

echo -e "${SERVER} [[Server]]"
npx cloc ../server/src
echo -e "${NC}"

echo -e "${SHARED} [[Shared]]"
npx cloc ../shared/src
echo -e "${NC}"

echo -e "${TOTAL} [[Total]]"
npx cloc ../client/src/ ../server/src/ ../shared/src/
echo -e "${NC}"
