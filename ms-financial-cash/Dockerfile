# 1. Usar una imagen ligera de Node.js
FROM node:18-alpine

# 2. Crear el directorio de trabajo
WORKDIR /usr/src/app

# 3. Copiar los archivos de dependencias
COPY package*.json ./

# 4. Instalar las dependencias de producción
RUN npm install --omit=dev

# 5. Copiar el resto del código del microservicio
COPY . .

# 6. Exponer el puerto 3005 (el que definimos para Financial)
EXPOSE 3005

# 7. Comando para arrancar el servicio
CMD ["npm", "start"]