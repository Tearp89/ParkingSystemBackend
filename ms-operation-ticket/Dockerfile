# 1. Usar node 18-alpine (ligera y estable)
FROM node:18-alpine

# 2. Crear directorio de trabajo
WORKDIR /usr/src/app

# 3. Copiar package.json y package-lock.json
# Lo hacemos antes para aprovechar la caché de capas de Docker
COPY package*.json ./

# 4. Instalar solo dependencias de producción
RUN npm install --omit=dev

# 5. Copiar todo el código (incluyendo carpetas de modelos, rutas, etc.)
COPY . .

# 6. Exponer el puerto 3004 (específico de ms-operation-ticket)
EXPOSE 3004

# 7. Comando de inicio
CMD ["npm", "start"]