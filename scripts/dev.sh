#!/bin/bash

cd "${0%/*}" && cd ..
(cd client && npm run serve) & sleep 8s && (cd server && npm run serve)
