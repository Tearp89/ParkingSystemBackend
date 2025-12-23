# 1. Usar una imagen ligera de Node.js
FROM node:18-alpine

# 2. Crear directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# 3. Copiar archivos de dependencias
COPY package*.json ./

# 4. Instalar dependencias (evitando instalar devDependencies si es producción)
RUN npm install --omit=dev

# 5. Copiar el resto del código de la aplicación
COPY . .

# 6. Exponer el puerto que usará el microservicio 
# (Este valor debe coincidir con el PORT en tu .env)
EXPOSE 3000

# 7. Comando para iniciar la aplicación
CMD ["npm", "start"]