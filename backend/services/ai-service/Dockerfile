# Dockerfile for ai-service OCR integration
FROM node:18

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source code
COPY . .

# Ensure custom traineddata files are included (if they exist)
# COPY src/ocr/config/languages/ src/ocr/config/languages/

# Expose port (adjust if your service uses a different port)
EXPOSE 3008

# Start the service (adjust entry point if needed)
CMD ["node", "src/ocr/app.js"]
