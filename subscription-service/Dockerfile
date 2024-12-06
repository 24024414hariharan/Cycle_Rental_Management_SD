# Use Node.js 18 alphine as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies
COPY package.json .

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

RUN npx prisma generate

# RUN npx prisma migrate dev

# Build the TypeScript code
RUN npm run build

# Expose the port the app runs on
EXPOSE 7000

# Start the application
CMD ["npm", "start"]
