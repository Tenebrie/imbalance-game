# NotGwent

"*NotGwent*" (temporary name) is a work-in-progress open-source trading card game. See *Rules*
section in the game for more information about the ruleset. 

## Try the game
See the stable version of the game in action at https://notgwent.herokuapp.com/

You can also see the deployed *Develop* branch (i.e. unstable builds) at https://pure-chamber-21653.herokuapp.com/

## Development
The development environment is dockerized, so you'll need to have a working Docker installation on your machine to
run the dev environment.

Please keep in mind that `client/src`, `server/src` and `shared/src` folders are shared between the host machine and
the Docker containers. If the code fails to compile, check that the shared folders are mounted correctly (a common 
issue with WSL).

### Running the app
`$ docker-compose up`

After the build, you can access any of the apps:

- Client: http://localhost:8080
- Server: http://localhost:3000
- Database: postgres://localhost:5432 
