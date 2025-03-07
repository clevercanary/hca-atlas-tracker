# hca-atlas-tracker

## Local development

### Setup

Use Node.js version `20.10.0`.

Run `npm install`.

Set up Postgres database (see "Using Postgres" section below).

### Using the development server

Run `npm run dev`. The app can be accessed at `http://localhost:3000`.

### Building the app

Run `npm run build:local` to build the app to be run locally. The built app can be run using `npm start`, and accessed at `http://localhost:3000`.

The development version of the app can similarly be built using `npm run build:dev`, and the production version using `npm run build:prod`.

### Using the Docker image

Run `docker build --build-arg ENVIRONMENT=local -t tracker-node -f Dockerfile.node .` to build the image for the locally-runnable app.

The container can be run using `docker run -p 3000:3000 tracker-node`.

To build the development or production app instead, replace `local` with `dev` or `prod` in the build command, e.g. for production: `docker build --build-arg ENVIRONMENT=prod -t tracker-node -f Dockerfile.node .`.

### Using Postgres

#### Setup

- Install Postgres using Homebrew: `brew install postgresql`
- Start the Postgres server: `brew services run postgresql`, or `brew services start postgresql` to have it restart on reboot
- Create a database: `createdb atlas-tracker`
- In the app directory, run `npm run migrate` to migrate up

#### Running queries in the terminal

- Run `psql atlas-tracker`
- Enter a query, e.g. `SELECT * FROM hat.users;`
- Enter `\q` to exit

### Running tests

In order to run tests, a test database must be created:

- `createdb atlas-tracker-test`

Once this has been done, tests may be run with `npm run test`.

### Updating saved CELLxGENE file info

To get Tier 1 metadata status, dataset files from CELLxGENE must be downloaded and read. This is done using a Python script, which exports a JSON file that's saved in the repository. To run the script:

- Create and activate the virtual environment, if necessary:
  - Use Python 3.12.4.
  - In the root of this repository, run `python3 -m venv ./venv`.
  - Run `source venv/bin/activate` to activate the environment.
  - Run `pip install -r catalog/build/requirements.txt` to install dependencies.
  - `deactivate` can be run to deactivate the virtual environment.
- Run `python3 catalog/build/get_cellxgene_files_info.py`.
- Troubleshooting:
  - If the script exits unexpectedly, the same command can be run again to resume. If resuming is not desired, `catalog/build/temporary/in-progress-info.json` should be deleted.
  - If a dataset is skipped due to a temporary HTTP error, the script can be re-run to patch missing info.
  - If the script crashes due to a file being to large, the `MAX_FILE_SIZE` variable in `get_cellxgene_files_info.py` can be edited to limit which files are processed.
