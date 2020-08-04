#!/bin/bash

cd "${0%/*}"
cloc ../client/src/ ../server/src/ ../shared/src/
