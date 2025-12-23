# 💰 Microservicio: MS-TARIFF-CONFIG

Este microservicio es el motor de reglas de negocio del sistema. Se encarga de definir cómo se cobra a cada vehículo y realizar el cálculo matemático del importe basado en el tiempo de estancia. [cite: 5, 7, 121]

## 🎯 Requerimientos Cubiertos

* **RF-06:** Soporte de estrategias de cobro (por hora, fracciones o bloques). 
* **RF-07:** Configuración de minutos de gracia, máximos diarios y reglas nocturnas. 
* **CU-07:** Interfaz para que el Administrador defina tarifas por sucursal y tipo de vehículo. 
* **CU-08:** Consulta de historial de tarifas vigentes y pasadas. 

## 🛠️ Tecnologías

* **Runtime:** Node.js (JavaScript) 
* **Framework:** Express.js 
* **ORM:** Sequelize con PostgreSQL 
* **Auth:** Verificación vía JWT contra `ms-user-auth` 

## 🧮 Lógica de Cálculo (Estrategias)

| Estrategia | Descripción |
| :--- | :--- |
| **Hourly** | Cobro por hora completa o fracción de hora (redondeo hacia arriba).  |
| **Fraction** | Cobro por bloques de minutos (ej. cada 15 min).  |
| **Step** | Cobro por rangos de tiempo (ej. primera hora precio X, el resto precio Y). |



## 🌐 Endpoints Principales (API v1)

### Gestión (Solo ADMIN)
* `POST /api/v1/tariffs`: Crea una nueva configuración de tarifa. 
* `GET /api/v1/tariffs/history/:branchId`: Obtiene el historial de tarifas de una sucursal. 

### Operación (Cajeros / Interno)
* `POST /api/v1/tariffs/calculate`: Recibe `entry_time`, `branch_id` y `vehicle_type_id` para devolver el monto a cobrar y el tiempo de estancia. 

## 🚀 Instalación rápida

1. Configurar `.env` con la base de datos `parking_tariff_db`.
2. Ejecutar `npm install`.
3. Iniciar con `npm start`.