# hca-atlas-tracker

## Local development

### Setup

Use Node.js version `20.10.0`. Run `npm install`.

### Using the development server

Run `npm run dev`. The app can be accessed at `http://localhost:3000`.

### Building the app

Run `npm run build:dev` to build the development version of the app. The built app can be run using `npm start`, and accessed at `http://localhost:3000`.

The production version of the app can similarly be built using `npm run build:prod`.

### Using the Docker image

Run `docker build --build-arg ENVIRONMENT=dev -t tracker-node -f Dockerfile.node .` to build the image for the development app.

The container can be run using `docker run -p 3000:3000 tracker-node`.

To build the production app, run `docker build --build-arg ENVIRONMENT=prod -t tracker-node -f Dockerfile.node .` instead.
