FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies including devDependencies for development
RUN npm install

# Copy source code  
COPY . .

EXPOSE 3001
CMD ["npx", "nodemon", "src/app.js"]
