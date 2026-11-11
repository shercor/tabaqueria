FROM node:24-slim

WORKDIR /app

# Primero solo los manifiestos, para reutilizar la capa de dependencias entre builds
COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npm run migrate && npm start"]
