#!/bin/bash

echo "Building client"
(cd client && npm run build)

echo "Clearing old client"
rm -rf server/client
echo "Moving new client files"
mkdir server/client
cp -r client/dist/* server/client/
echo "Committing new files"
(cd server && git add client && git commit)
echo "Pushing to Heroku"
(git push heroku master)
if [ "$SERVER_CHANGED" = true ] ; then
	echo "Restoring the stash"
	(cd server && git stash pop)
fi
