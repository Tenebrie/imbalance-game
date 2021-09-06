#!/bin/bash

cd "${0%/*}"

TOTAL='\033[0;35m'
NC='\033[0m'
echo -e "${TOTAL} [[Total]]"
npx cloc ../client/src/ ../server/src/ ../shared/src/
echo -e "${NC}"
