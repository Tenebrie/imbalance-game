#!/bin/bash

cd "${0%/*}"

CLIENT='\033[0;33m'
GAIA='\033[0;32m'
OVERMIND='\033[0;31m'
SHARED='\033[0;34m'
TOTAL='\033[0;36m'

NC='\033[0m'

echo -e "${CLIENT} [[Client]]"
npx cloc ../client/src
echo -e "${NC}"

echo -e "${GAIA} [[Gaia]]"
npx cloc ../services/gaia/src
echo -e "${NC}"

echo -e "${OVERMIND} [[Overmind]]"
npx cloc ../services/overmind/src
echo -e "${NC}"

echo -e "${SHARED} [[Shared]]"
npx cloc ../shared/src
echo -e "${NC}"

echo -e "${TOTAL} [[Total]]"
npx cloc ../client/src/ ../services/gaia/src/ ../services/overmind/src ../shared/src/
echo -e "${NC}"

