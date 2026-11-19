# EcoBite - Backend

Backend de **EcoBite**, una plataforma FoodTech orientada a la comercialización de productos gastronómicos mediante envases compostables y biodegradables.

Este proyecto gestiona usuarios, clientes, restaurantes, productos, horarios, pedidos, carritos y estadísticas de impacto ambiental.

## Tecnologías utilizadas

- **Node.js:** entorno de ejecución de JavaScript.
- **Express 5:** framework para desarrollar la API REST.
- **PostgreSQL:** sistema de gestión de base de datos relacional.
- **node-postgres (pg):** conexión entre Node.js y PostgreSQL.
- **JSON Web Token (JWT):** autenticación de usuarios.
- **bcrypt:** encriptación de contraseñas.
- **Multer:** recepción de archivos.
- **Cloudinary:** almacenamiento y gestión de imágenes.
- **Nodemailer:** gestión de correos electrónicos.
- **node-cron:** ejecución de tareas programadas.
- **express-rate-limit:** limitación de solicitudes.
- **CORS:** configuración de acceso entre el frontend y el backend.
- **dotenv:** gestión de variables de entorno.

## Requisitos previos

Para ejecutar el backend en un entorno local se necesita:

- Node.js y npm.
- PostgreSQL.
- Una herramienta para administrar PostgreSQL, como pgAdmin.
- Git (opcional, para clonar el repositorio).

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/Talentry-Lab/s2603-EcoBite.git
```

### 2. Ingresar a la carpeta del backend

```bash
cd s2603-EcoBite/backend
```

### 3. Instalar las dependencias

```bash
npm install
```

### 4. Configurar las variables de entorno

Crear un archivo `.env` en la raíz de la carpeta `backend`, tomando como referencia el archivo `.env.example`.

Completar las variables con los datos correspondientes al entorno local:

```env
# Base de datos PostgreSQL (entorno local)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecobite
DB_USER=postgres
DB_PASSWORD=

# Base de datos PostgreSQL (entorno de producción)
DATABASE_URL=

# Autenticación JWT
JWT_SECRET=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**Importante:** el archivo `.env` contiene información privada y no debe subirse al repositorio. Cada integrante debe configurar sus propias credenciales.

### 5. Crear y configurar la base de datos

Crear una base de datos llamada `ecobite` en PostgreSQL y restaurar su estructura utilizando alguno de los archivos disponibles en la carpeta `database`.

Consultar las instrucciones detalladas en [`database/README.md`](database/README.md).

### 6. Iniciar el servidor

Desde la carpeta `backend`, ejecutar:

```bash
npm start
```

El servidor se iniciará utilizando el puerto configurado en `PORT` o, si no está definido, el puerto local `3000`.

## Estructura del proyecto

```text
backend/
│
├── database/
│   ├── ecobite.sql
│   ├── ecobite_backup.backup
│   └── README.md
│
├── src/
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── subirImagen.js
│   │
│   ├── models/
│   │   ├── carrito.model.js
│   │   ├── cliente.model.js
│   │   ├── dashboard.model.js
│   │   ├── detalleCarrito.model.js
│   │   ├── horario_restaurante.model.js
│   │   ├── pedido.model.js
│   │   ├── producto.model.js
│   │   ├── restaurante.model.js
│   │   └── usuario.model.js
│   │
│   ├── services/
│   │   ├── email.service.js
│   │   └── emailPreview.service.js
│   │
│   ├── utils/
│   │   └── validaciones.js
│   │
│   ├── cloudinary.js
│   ├── cloudinary.utils.js
│   ├── db.js
│   └── server.js
│
├── .env
├── .env.example
├── .gitignore
├── package-lock.json
├── package.json
└── README.md
```

### Organización del código

- **middlewares:** contiene los middlewares de autenticación, autorización y carga de imágenes.
- **models:** contiene las consultas y operaciones relacionadas con las tablas de la base de datos.
- **services:** contiene la lógica relacionada con los servicios de correo electrónico y sus vistas previas.
- **utils:** contiene funciones auxiliares y validaciones.
- **cloudinary.js y cloudinary.utils.js:** configuración y utilidades para trabajar con Cloudinary.
- **db.js:** configura y exporta el pool de conexiones a PostgreSQL.
- **server.js:** configura Express y contiene las rutas de la API.

## Base de datos y conexión

El archivo `src/db.js` permite trabajar tanto en desarrollo local como en producción.

- **Entorno local:** utiliza las variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASSWORD`.
- **Entorno de producción:** utiliza `DATABASE_URL` para conectarse a PostgreSQL alojado en la nube.

Si `DATABASE_URL` está definida, se utiliza esa conexión. De lo contrario, se utilizan los parámetros individuales.

## Endpoints de la API

Los siguientes endpoints se encuentran organizados según su funcionalidad. Las rutas protegidas requieren autenticación mediante token JWT y algunas también requieren un rol específico.

### General

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/` | Ruta principal de la API. |

### Usuarios y autenticación

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/usuario/registro-cliente` | Registro de clientes. |
| POST | `/api/usuario/registro-restaurante` | Registro de restaurantes. |
| POST | `/api/usuario/login` | Inicio de sesión. |
| GET | `/api/usuarios` | Listado de usuarios. |
| GET | `/api/usuarios/:id` | Consulta de un usuario por ID. |
| PUT | `/api/usuarios/:id` | Actualización de datos de un usuario. |
| DELETE | `/api/usuarios/:id` | Eliminación de un usuario. |
| GET | `/api/usuario/verificar-email` | Verificación de disponibilidad de email. |

### Clientes

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/clientes` | Creación del perfil de cliente. |
| GET | `/api/clientes` | Listado de clientes. |
| GET | `/api/clientes/:id` | Consulta de un cliente por ID. |
| PUT | `/api/clientes/:id` | Actualización de un cliente. |
| DELETE | `/api/clientes/:id` | Eliminación de un cliente. |

### Restaurantes

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/restaurantes` | Listado de restaurantes. |
| GET | `/api/restaurantes/verificar-cuit` | Verificación de disponibilidad de CUIT. |
| POST | `/api/restaurantes` | Creación de un restaurante. |
| GET | `/api/restaurantes/:id` | Consulta de un restaurante por ID. |
| PATCH | `/api/restaurantes/:id` | Actualización de datos del restaurante. |
| PATCH | `/api/restaurantes/:id/imagen` | Actualización de la imagen del restaurante. |
| DELETE | `/api/restaurantes/:id` | Eliminación de un restaurante. |
| GET | `/api/restaurantes/:id/productos` | Consulta de productos de un restaurante. |
| GET | `/api/restaurantes/:id/productos/gestion` | Consulta de productos para su gestión. |
| GET | `/api/restaurantes/:id/estado` | Consulta del estado del restaurante. |

### Productos

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/productos` | Creación de un producto. |
| PATCH | `/api/productos/:id` | Actualización de un producto. |
| PATCH | `/api/productos/:id/imagen` | Actualización de la imagen de un producto. |
| DELETE | `/api/productos/:id` | Eliminación de un producto. |

### Horarios de restaurantes

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/restaurantes/:id/horarios` | Creación de horarios. |
| GET | `/api/restaurantes/:id/horarios` | Consulta de horarios. |
| PUT | `/api/restaurantes/:id/horarios/:idHorario` | Actualización de un horario. |
| DELETE | `/api/restaurantes/:id/horarios/:idHorario` | Eliminación de un horario. |
| POST | `/api/restaurantes/:id/horarios/turno` | Gestión de un turno horario. |

### Pedidos

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/ordenes` | Creación de un pedido. |
| GET | `/api/ordenes/costo-envio` | Consulta del costo de envío. |
| PATCH | `/api/ordenes/:id/aceptar` | Aceptación de un pedido. |
| PATCH | `/api/ordenes/:id/despachar` | Despacho de un pedido. |
| PATCH | `/api/ordenes/:id/recibido` | Confirmación de recepción. |
| PATCH | `/api/ordenes/:id/no-entregado` | Registro de pedido no entregado. |
| PATCH | `/api/ordenes/:id/calificar` | Calificación de un pedido. |
| PATCH | `/api/ordenes/:id/rechazar` | Rechazo de un pedido. |
| PATCH | `/api/ordenes/:id/cancelar` | Cancelación de un pedido. |
| GET | `/api/ordenes/mis-pedidos` | Consulta de pedidos del cliente autenticado. |
| GET | `/api/ordenes/:id/detalle` | Consulta del detalle de un pedido. |
| GET | `/api/ordenes/restaurante/mis-pedidos` | Consulta de pedidos del restaurante autenticado. |
| GET | `/api/ordenes/restaurante/:id/detalle` | Consulta del detalle de un pedido desde el restaurante. |

### Carritos

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/carritos` | Consulta de carritos. |
| GET | `/api/carritos/:idCarrito` | Consulta de un carrito por ID. |
| POST | `/api/carritos/:idRestaurante/productos` | Incorporación de productos al carrito. |
| PATCH | `/api/carritos/:idCarrito/productos/:idProducto` | Actualización de un producto del carrito. |
| DELETE | `/api/carritos/:idCarrito/productos/:idProducto` | Eliminación de un producto del carrito. |
| DELETE | `/api/carritos/:idCarrito` | Eliminación de un carrito. |

### Dashboard e impacto ambiental

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/dashboard/stats` | Consulta de estadísticas del dashboard. |
| GET | `/api/dashboard/impacto` | Consulta de indicadores de impacto ambiental. |
| GET | `/api/dashboard/impacto/cliente` | Consulta del impacto ambiental del cliente. |

### Vistas previas de correo electrónico

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/email-preview/:id` | Consulta de una vista previa de correo electrónico. |

### Funcionamiento de las vistas previas de correo electrónico

El backend cuenta con un sistema de generación de vistas previas HTML para los correos electrónicos de bienvenida y recordatorio de carritos abandonados.

El endpoint `GET /api/email-preview/:id` permite visualizar estas plantillas en el navegador mediante un enlace temporal.

**Importante:** debido a las limitaciones del entorno de alojamiento gratuito de Render para el envío de correos mediante SMTP, actualmente se generan vistas previas de los correos, pero no se realiza el envío real a los usuarios.

Esta funcionalidad permite visualizar y demostrar el contenido de los correos mientras queda pendiente la integración de un servicio de envío compatible con el entorno de producción.

**Nota:** los endpoints pueden requerir autenticación y permisos específicos según el rol del usuario. Para consultar los parámetros, los cuerpos de las solicitudes y las validaciones de cada operación, revisar las implementaciones correspondientes en `src/server.js`.

## CORS

La API tiene configurado CORS para permitir solicitudes desde los siguientes orígenes:

- Desarrollo local: `http://localhost:5173`
- Frontend desplegado: `https://s2603-eco-bite.vercel.app`

Si se modifica el dominio del frontend, también deberá actualizarse la configuración de CORS en `src/server.js`.

## Despliegue

El backend se encuentra desplegado en **Render** y utiliza una base de datos PostgreSQL alojada en la nube.

URL de la API:

https://ecobite-backend-1ldk.onrender.com

Las variables de entorno de producción se configuran desde el panel de Render. No deben incluirse credenciales reales en el repositorio.

