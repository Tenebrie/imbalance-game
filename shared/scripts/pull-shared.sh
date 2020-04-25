#!/bin/bash

(cd "$(dirname "$0")" && cd ../.. && chmod -R 0777 client/src/Pixi/shared && rm -rf client/src/Pixi/shared && mkdir client/src/Pixi/shared && cp -r shared/src/* client/src/Pixi/shared/)
(cd "$(dirname "$0")" && cd ../.. && chmod -R 0777 server/src/game/shared && rm -rf server/src/game/shared && mkdir server/src/game/shared && cp -r shared/src/* server/src/game/shared/)

