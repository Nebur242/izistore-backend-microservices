# Step 1: Use an official Node.js image as a base
FROM node:18-alpine AS build

# Step 2: Set working directory inside the container
WORKDIR /app/api-gateway

# Step 3: Copy package.json and package-lock.json (if available) to the container
COPY package*.json ./

# Step 4: Install dependencies (this step is separated to cache dependencies layer)
RUN npm install --production

# Step 5: Copy the rest of the application code into the container
COPY . .

# Step 6: Build the app if applicable (for example, with TypeScript or bundlers like Webpack)
# RUN npm run build  # Uncomment if you have a build step

# Step 7: Expose the port the app will listen on
EXPOSE 3000

# Step 8: Set the command to run the application
CMD ["node", "main.js"] 
