#!/bin/bash

echo "Building client"
(cd client && npm run build)

cd server
if ! git diff-index --quiet HEAD --; then
	echo "Stashing changes in server"
	SERVER_CHANGED=true
	git stash
else
	echo "No changes in server"
	SERVER_CHANGED=false
fi
cd ..

echo "Clearing old client"
rm -rf server/public/client
echo "Moving new client files"
mkdir server/public/client
cp -r client/dist/* server/public/client/
echo "Committing new files"
(cd server && git add public/client && git commit -m "Client update")
echo "Pushing to Heroku"
(cd server && git push heroku master)
if [ "$SERVER_CHANGED" = true ] ; then
	echo "Restoring the stash"
	(cd server && git stash pop)
fi
