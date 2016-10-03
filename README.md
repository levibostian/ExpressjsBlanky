# ExpressjsBlanky
Get up and running FAST on your next API project.

# Development
The API is configured for development, staging, and production builds.

```
npm install
export NODE_ENV="development"
npm start
```

# Install and run staging/production
* The API is setup to create staging, testing, and production environments. Depending on what environment you are looking to create, this is what you need to do:  

  * `staging`: run `export NODE_ENV="production"` (assuming staging is under the same server as production so this works just fine to se this). Then make sure to host the API code in a directory containing the word "staging". I recommend `/var/www/staging.blanky.com`. This will set the port to run on 5050 while production runs on 5000.
  * `production`: run `export NODE_ENV="production"`. Then make sure to host the API code in a directory *not* containing the word "staging". I recommend `/var/www/api.blanky.com`. This will set the port to run on 5000 while staging, if you decide to host a staging instance, runs on 5050.
  * `testing` (aka dev): follow the directions in this README (under development) to get the dev environment going on your machine. Testing/dev is made for local machines to run tests under. Tests generate *lots* of junk data in your database so make sure not on a server running tests (as long as NODE_ENV is set to development, tests will not run on production server).

* `npm install`
* `export BLANKY_DATABASE_URL="postgres://postgres_username:postgres_user_password@localhost:5432/databasename"` <-- add this to your ~/.bashrc file to persist it after reboots of system and also run it from the command line to make it work for now until the next reboot.
* `export NODE_ENV="production"` to change paths to our API in prod.
* `psql -U postgres_username -d databasename -f sql/create_schema.sql -h 127.0.0.1`
* `npm start` will start the API from the command line for now. However, there is a forever script set to run at reboot crontab so it should run at bootup already.

# Documentation
This API is uses [apidoc](http://apidocjs.com/) for API documentation.
All documentation is located in HTML in `apidoc/`. You can open `apidoc/index.html` directly in your web browser to view the API documentation.
