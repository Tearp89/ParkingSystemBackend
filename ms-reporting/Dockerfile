# 1. Imagen base estable
FROM node:18-alpine

# 2. Directorio de trabajo
WORKDIR /usr/src/app

# 3. Copiar archivos de dependencias
COPY package*.json ./

# 4. Instalar dependencias de producción
# Nota: Reporting necesita 'axios' para hablar con Auth
RUN npm install --omit=dev

# 5. Copiar el código fuente
COPY . .

# 6. Exponer el puerto de Reportes
EXPOSE 3006

# 7. Arrancar el servicio
CMD ["npm", "start"]