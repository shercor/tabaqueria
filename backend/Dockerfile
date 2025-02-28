# Instala node llamando a la imagen
FROM node:18-slim

# Instalar netcat
#RUN apt-get update && apt-get install -y netcat

# Crea el directorio app
WORKDIR /app

# Se copian los archivos
COPY package*.json ./

# Se corre el comando npm install
RUN npm install --include=dev
RUN npm install -g nodemon
#RUN npm install -g concurrently

# Descarga el script wait-for-it para esperar la base de datos
RUN apt-get update && apt-get install -y curl && \
    curl -o /usr/local/bin/wait-for-it https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh && \
    chmod +x /usr/local/bin/wait-for-it

# Copia todo lo presente en este directorio, en el directorio actual de trabajo
COPY . .

# Instrucciones finales para ejecutar los comandos para correr la App Dockerizada
#CMD ["wait-for-it", "db:3306", "--", "npm", "start"]
CMD ["wait-for-it", "db:3306", "--", "sh", "-c", "npm run server"]
