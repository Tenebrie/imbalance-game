# NotGwent

"*NotGwent*" (temporary name) is a work-in-progress open-source trading card game. See *Rules*
section in the game for more information about the ruleset.

## Try the game
You can play the current stable version of the game at https://app.tenebrie.com/. Automatically deployed
from the *Master* branch.

You can also test the latest version, deployed straight from the *Develop* branch (i.e. unstable builds),
at https://pure-chamber-21653.herokuapp.com/

Both environments go to sleep after long periods of inactivity, and may take up to 30 seconds to boot up again.

## Licensing
Please note that while the code is licensed under GPL v3.0, all the art assets
are property of their respective owners.

## Development
The development environment is dockerized, so you'll need to have a working Docker installation on your machine to
run the dev environment. It is tested in WSL2 and on Mac OS, but any valid installation should work fine.

Please keep in mind that `client/src`, `server/src` and `shared/src` folders are shared between the host machine and
the Docker containers. If the code fails to compile, check that the shared folders are mounted correctly (a common 
issue with WSL).

### Running the app
`$ docker-compose up`
or
`$ yarn docker:start`

After the build, you can access any of the apps:

- Client: http://localhost:8080
- Server: http://localhost:3000
- Database: [postgres://localhost:5432](postgres://localhost:5432)

### Deploying to Heroku
All the necessary build steps are built into the root `package.json` file, so for deployment it's enough to push
the code to Heroku. Everything is automated after that point.

### Manual deployment
From the repository root run the following to download the dependencies and move the client files to the server
folder:

`$ npm install && npm run build`

To run the server:

`$ npm run start`

The server binds to a port specified by `PORT` environmental variable or defaults to `3000`. 

## Architecture
This is a standard web application, with the frontend written in *Vue.js* and *Pixi.js*, backend - *Express.js* with
*Node.js*, and the data is stored in the *Postgres* database.

All the relevant code uses *TypeScript*.
