# hca-atlas-tracker

## Local development

### Setup

Use Node.js version `20.10.0`.

Run `npm install`.

If planning to run the app, run `npm run build-catalog` to build the catalog data.

### Using the development server

Run `npm run dev`. The app can be accessed at `http://localhost:3000`.

### Building the app

Run `npm run build:local` to build the app to be run locally. The built app can be run using `npm start`, and accessed at `http://localhost:3000`.

The production version of the app can similarly be built using `npm run build:prod`.

### Using the Docker image

Run `docker build --build-arg ENVIRONMENT=local -t tracker-node -f Dockerfile.node .` to build the image for the locally-runnable app.

The container can be run using `docker run -p 3000:3000 tracker-node`.

To build the production app, run `docker build --build-arg ENVIRONMENT=prod -t tracker-node -f Dockerfile.node .` instead.
