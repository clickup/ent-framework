@slapdash/ent-framework / [Exports](modules.md)

![](https://github.com/time-loop/slapdash/workflows/Build/badge.svg)

# slapdash

## Dev Environment

- Install Homebrew: https://brew.sh
- Install NVM to manage Node versions: `brew install nvm`
- Add the following (or whatever the brew/nvm output says) to your
  `.bashrc`/`.zshrc` to complete the NVM installation:

      export NVM_DIR="$HOME/.nvm"
      . /opt/homebrew/opt/nvm/nvm.sh
      . /opt/homebrew/opt/nvm/etc/bash_completion.d/nvm

- Restart your terminal session
- Install & run https://www.docker.com/products/docker-desktop
- **IMPORTANT**: Give Docker Desktop (Preferences - Advanced) 2 CPU cores, 3 GB memory and 512 MB swap.
- `git clone git@github.com:time-loop/slapdash.git` (use SSH key authentication)
- Install project-specific node version: `cd slapdash && nvm install && nvm alias default $(cat .nvmrc)`
- Install yarn: `npm -g install yarn`
- Install Doppler CLI: `brew install dopplerhq/cli/doppler`
  - for guest purposes, you may use Doppler shared token; run: `echo "[token]" | doppler configure set token; doppler setup` where "[token]" is brought from Dashlane "Doppler" record ("Password" field);
  - or, for a new full-time Slapdash engineer, ask to invite your email to https://dashboard.doppler.com/workplace/e4043/team and create a dev config for you, then in the git-cloned folder run: `doppler login && doppler setup`
- Install `psql` command-line tool: `brew install libpq && brew link --force libpq`
- For Macs with Apple Silicone (aka M1): `softwareupdate --install-rosetta`

## Bootstrap schema & data

Before starting VSCode, start dev environment:

    yarn build    # only once after cloning
    yarn dev

Configure VSCode to use the workspace version of TypeScript and not the one
which is bundled with it. Click on the TS version number on the bottom right of
VSCode window, then "Select TypeScript version...", and then "Use Workspace
Version".

Dev environment initializes everything during each run, but once you pulled the
latest changes from git, you may need to run the following steps manually (or
just restart "yarn dev").

    yarn db:migrate                   # apply DB migrations (slapdash_development/test DBs)
    yarn db:bootstrap                 # e.g. create rows in apps table in the DB
    yarn es:reset --force             # reset ES indexes & initiate backfilling

## Run the Server

Keep the docker dev environment running at all time:

    yarn dev

The site should be available at https://dev.slapdash.app (it points to the local machine).

### Create your first Slapdash user

Go to https://dev.slapdash.app/create/

To grant yourself [admin](https://dev.slapdash.app/admin) access:

    yarn psql -c "UPDATE sh0000.passports SET is_admin=true WHERE email='YOUR@EMAIL.XYZ'"

## Run Tests

    yarn test

## More scripts

Utility scripts can be found in slapdash-server/src/scripts (compiled to dist/
folder). Some examples:

    yarn test
    yarn test TestFileName.ts
    yarn test TestFileName.ts -t test-name --watch
    SQL=1 yarn test # To show SQL queries.
    SQL=1 yarn dev # To show SQL queries. Very verbose, use carefully.
    yarn dev:schedule -q index-app-full -u dko@ahoy-hoy.io -a drive
    yarn dev:schedule -q index-app-full -u oleg@slapdash.com -a all # To index everything
    yarn debug-electron
    yarn resolve-asset-url https://drive.google.com/...
    yarn db:reset  # cleans all the rows in the DB
    yarn es:reset  # re-creates all ES indexes
    yarn lint # Run ESLint on everything
    yarn lint --fix # Run ESLint on everything and try to fix what is fixable.

## Some examples for PostgreSQL command-line

    $ yarn psql
    # \l                  # lists databases
    # \dt sh0001          # lists tables in shard sh0001
    # \du                 # lists users
    # \d sh00001.assets   # lists columns/indices/whatever of a table

Also, on each physical machine, the pg-mig migration framework creates (and automatically keeps up-to-date) debug views for the union of each table in each shard. You can query these views for debugging purposes:

    yarn psql
    # select * from assets where title like '%abc%';  -- searches all assets in all shards

## Creating migrations

Run `yarn db:migrate --make=name@schemaPrefix` to create empty migration files
for a given schema prefix. Examples:

    # To apply changes for each shard. Used for sharded tables.
    yarn db:migrate --make=assets_new_indexes@sh

    # To apply changes for global shard. Used for global-shard tables.
    yarn db:migrate --make=assets_new_indexes@sh0000

    # To apply changes everywhere. Used for system functions and other global changes.
    yarn db:migrate --make=creds@public

# DANGER ZONE!

## Deployment to production

We currently have scripts to automated deployment of server and worker.

    deploy/deploy.sh

It is good idea to watch the pm2 logs for any errors which you can do by `ssh ubuntu@{server00,worker00}.slapdash.app` and running `pm2 logs`, as well as watching any dashboards (honeycomb and aws).

- https://us-east-2.console.aws.amazon.com/cloudwatch/home?region=us-east-2#dashboards:name=slapdash
- https://ui.honeycomb.io/slapdash/board/XH3hVGxZej

Watch https://slapdash.com/arena/ for queues state.

## Prod configuration for server and worker machines

See `bare-metal/*.sh` scripts (the commands must be run manually, step by step).

There is a way to test pm2+nginx configuration on dev environment:

    npm install -g pm2
    cd packages/slapdash-server
    pm2 delete all
    pm2 start pm2_server.json
    pm2 list && pm2 logs
    docker-compose kill nginx; docker-compose up nginx
    pm2 kill
