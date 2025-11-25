# 🅿️ Sistema de Gestión de Cadenas de Estacionamiento (SGCE)

Este es un proyecto basado en arquitectura de **Microservicios** (o SOA) diseñado para administrar una cadena de múltiples estacionamientos (sucursales). Controla el registro de vehículos, el cálculo automático de tarifas, los cortes de caja y la generación de reportes operativos y consolidados.

---

## 🏛️ Arquitectura del Sistema

El sistema está diseñado como un conjunto de **servicios independientes** que se comunican entre sí. Cada microservicio es responsable de un dominio específico y cumple con la **Arquitectura en Capas** (Datos, Dominio/Servicios, Exposición) para mejorar la mantenibilidad y escalabilidad.

### Microservicios Definidos

| Microservicio | Dominio / Responsabilidad Principal | Tecnologías | Entidades Clave |
| :--- | :--- | :--- | :--- |
| **`ms-core-branch`** | **Infraestructura:** Gestión de sucursales y lugares de estacionamiento. | Node.js, Express, Sequelize | `Branch`, `ParkingSpot` |
| **`ms-user-auth`** | **Seguridad y Usuarios:** Autenticación (Login) y gestión de roles/permisos. | Node.js, JWT | `User` |
| **`ms-tariff-config`** | **Tarifas:** Definición y cálculo de tarifas complejas (por hora, fracción, bloques). | Node.js, Express, Sequelize | `Tariff`, `VehicleType` |
| **`ms-operation-ticket`** | **Operación Diaria:** Registro de entradas, salidas, cálculo de tiempo y estado de tickets. | Node.js, Express, Sequelize | `Ticket` (o `Session`) |
| **`ms-financial-cash`** | **Caja y Pagos:** Registro de pagos, métodos de pago y realización de cortes de caja. | Node.js, Express, Sequelize | `Payment`, `CashCut` |
| **`ms-reporting`** | **Reportes:** Consolidación de datos para reportes de ocupación e ingresos (Dashboard). | Node.js, Cliente de DB/Data Warehouse | N/A (Lógica de consulta) |

### Requerimientos No Funcionales (RNF)

El diseño cumple con los siguientes requerimientos clave:
* [cite_start]**Tecnología:** Backend en **Node.js** con **JavaScript**[cite: 134, 238].
* [cite_start]**Base de Datos:** Uso de motor de base de datos **relacional** (PostgreSQL)[cite: 135].
* [cite_start]**Arquitectura:** Separación clara en capas de Datos, Dominio/Servicios y Exposición (REST/GraphQL)[cite: 136, 137, 138, 139].
* [cite_start]**Seguridad:** Operaciones protegidas mediante **autenticación por rol** (JWT)[cite: 141].

---

## 🛠️ Guía de Configuración y Ejecución

Esta guía asume que se clonará cada microservicio en directorios separados.

### 1. Prerrequisitos

* **Node.js:** Versión 16+
* **Gestor de Paquetes:** `npm` o `yarn`
* **Base de Datos:** **PostgreSQL**
* **Herramienta de Orquestación (Recomendada):** Docker / Docker Compose (para entornos de desarrollo).

### 2. Configuración de Entorno

Cada microservicio debe tener su propio archivo **`.env`** en la raíz para las variables de entorno:

```env
# Ejemplo de configuración
PORT=300X # Puerto único para cada servicio (ej. 3001, 3002, etc.)

# Configuración de PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=parking_service_db_<NOMBRE_SERVICIO>
DB_USER=user_dev
DB_PASS=secret_password

# Clave secreta para JWT (Compartida entre ms-user-auth y otros MS para verificación)
JWT_SECRET=tu_secreto_seguro_y_largo