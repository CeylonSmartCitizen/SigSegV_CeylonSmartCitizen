FROM node:18-alpine

WORKDIR /app

# Copy package.json first for better caching
COPY package*.json ./
RUN npm install


RUN npm ci


# Copy source code
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
