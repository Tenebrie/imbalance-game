#!/bin/bash

(cd "$(dirname "$0")" && cd ../.. && rm -rf client/src/shared && mkdir client/src/shared && cp -r shared/src/* client/src/shared/)
(cd "$(dirname "$0")" && cd ../.. && rm -rf server/src/shared && mkdir server/src/shared && cp -r shared/src/* server/src/shared/)

