yarn tsc --incremental --tsBuildInfoFile dist/tsBuildInfo.json

mkdir -p dist/server/src/views
cp src/views/*.jade dist/server/src/views

mkdir -p src/game/rulesets/other
cp -n -p src/templates/RulesetDev.template.ts src/game/rulesets/other/RulesetDev.ts
chmod -R 777 src/game/rulesets/other

node --experimental-modules dist/server/src/app.js
