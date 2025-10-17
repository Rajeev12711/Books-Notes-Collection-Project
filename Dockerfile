# Use official Node.js LTS image
FROM node:18

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy app source code
COPY . .

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
