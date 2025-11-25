# 🏢 Microservicio: MS-CORE-BRANCH

Este microservicio forma parte del **Sistema de Gestión de Cadenas de Estacionamiento**. Su responsabilidad principal es gestionar la infraestructura física de la cadena: **Sucursales (Branch)** y **Lugares de Estacionamiento (ParkingSpot)**.

---

## 🎯 Objetivo

Implementa los siguientes Requerimientos Funcionales (RF) y Casos de Uso (CU) del sistema:

* **RF-01:** Registrar múltiples sucursales (identificador único, nombre, código, capacidad, zona horaria).
* **RF-02:** Administrar los lugares de estacionamiento asociados a cada sucursal.
* **CU-01:** Registrar sucursal (Alta/Baja/Edición).
* **CU-02:** Gestionar lugares de estacionamiento (Alta/Baja/Edición).

## ⚙️ Tecnologías

* **Lenguaje:** JavaScript (Node.js)
* **Framework:** Express.js
* **ORM:** Sequelize
* **Base de Datos:** PostgreSQL
* **Arquitectura:** Microservicios / SOA

## 💻 Configuración Local

Sigue estos pasos para levantar el microservicio en tu entorno de desarrollo.

### 1. Requisitos Previos

Asegúrate de tener instalado:
* Node.js (versión 16 o superior)
* npm (o yarn)
* Una instancia de PostgreSQL funcionando.

### 2. Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>/ms-core-branch
cd ms-core-branch

``` 
### 3. Instalar dependencias 
```bash
npm install
# o yarn install
```

### 4. Configuración de variables de entorno
```
# Puerto del servicio
PORT=3001

# Configuración de PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=parking_branch
DB_USER=user_dev
DB_PASS=secret_password
```
### 5. Inicialización y ejecución 
```bash
# Sincroniza los modelos con la base de datos y levanta el servidor Express
npm start
```
## Endpoints principales
|**Método**|**Ruta**|**Descripción**|**Rol Requerido**|
|---|---|---|---|
|`POST`|`/api/v1/branches`|**CU-01:** Registra una nueva sucursal.|`ADMIN`|
|`GET`|`/api/v1/branches`|Lista todas las sucursales.|`ADMIN`|
|`POST`|`/api/v1/branches/:branchId/spots`|**CU-02:** Agrega un nuevo lugar de estacionamiento.|`ADMIN`, `SUPERVISOR`|
|`GET`|`/api/v1/branches/:branchId/spots`|Consulta la lista de lugares de una sucursal.|`ADMIN`, `SUPERVISOR`|
|`PUT`|`/api/v1/branches/:branchId/spots/:spotId`|Actualiza o marca un lugar como inactivo.|`ADMIN`, `SUPERVISOR`|
