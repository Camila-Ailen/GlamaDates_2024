# Use the official Node.js image as the base image
FROM node:22 AS fma-gateway

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application files
# Disable for now, as we are using a volume to mount the source code
# COPY . .

# Build the NestJS application
# RUN npm run build

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start:dev"]
