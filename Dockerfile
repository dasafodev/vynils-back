# Use an official Node runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

RUN npm install -g @nestjs/cli

# Bundle app source
COPY . .

# Build your app
RUN npm run build

# The port your app listens to
EXPOSE 3000

# Command to run the app
CMD ["npm", "run", "start:prod"]
