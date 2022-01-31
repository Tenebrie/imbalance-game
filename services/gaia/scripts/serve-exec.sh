set -e
yarn ttsc --incremental --tsBuildInfoFile dist/tsBuildInfo.json
yarn build:jade
yarn build:assets

mkdir -p src/game/rulesets/other
cp -n -p src/templates/RulesetDev.template.ts src/game/rulesets/other/RulesetDev.ts
chmod -R 777 src/game/rulesets/other

node --experimental-modules dist/services/gaia/src/app.js
