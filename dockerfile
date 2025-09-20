# Use lightweight Node.js 18 Alpine base image

FROM node:18-alpine
 
# Set the working directory inside the container
WORKDIR /app
 
# Copy only package.json and yarn.lock first to optimize caching

COPY package.json yarn.lock ./
 
# Install only production dependencies
RUN yarn global add @swc/cli @swc/core

RUN yarn install --production
 
# Copy the rest of the application files

COPY . .
 
# Expose the application port

EXPOSE 3000
 
# Start the Express.js server

CMD ["yarn", "dev"]
 