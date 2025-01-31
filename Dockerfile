# Use an official Node runtime as a parent image
FROM node:20.12.2

# Set the working directory in the container
WORKDIR /mybudgetapi

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN yarn install

# Copy the rest of the code
COPY . .

# Build the app
RUN npm run build

# Run migrations before starting the server
CMD npx typeorm migration:run -d dist/typeorm-cli.config && npm start