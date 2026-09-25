# EcoBite Backend

Backend de la aplicación **EcoBite**, desarrollado con Node.js y Express.

## Tecnologías

Actualmente, el backend cuenta con las siguientes dependencias:

* **Express:** framework utilizado para desarrollar la API REST.
* **CORS:** permite configurar la comunicación entre el frontend y el backend.
* **dotenv:** permite manejar variables de entorno mediante un archivo `.env`.
* **pg:** permite conectar Node.js con una base de datos PostgreSQL.
* **Nodemon:** herramienta de desarrollo que reinicia automáticamente el servidor cuando se detectan cambios en el código.

> Algunas de estas dependencias ya están instaladas, pero su configuración y utilización se realizará durante el desarrollo del proyecto.

## Instalación

### 1. Instalar Node.js

Es necesario tener Node.js instalado para ejecutar el backend.

### 2. Instalar las dependencias

La carpeta `node_modules` **no se incluye en el repositorio**.

Después de clonar el proyecto, ingresar a la carpeta del backend:

```bash
cd backend
```

Luego ejecutar:

```bash
npm install
```

Este comando utiliza `package.json` y `package-lock.json` para descargar las dependencias del proyecto y crear automáticamente la carpeta `node_modules`.

No es necesario instalar las dependencias una por una.

### 3. Variables de entorno

El proyecto utilizará variables de entorno para configurar datos que no deben estar directamente escritos en el código, como configuraciones de la aplicación o datos de conexión a la base de datos.

Cuando se configure esta parte del proyecto, se utilizará un archivo:

```text
.env
```

El archivo `.env` no debe subirse al repositorio.

Se utilizará un archivo `.env.example` para indicar qué variables necesita el proyecto, sin incluir datos privados.

### 4. Desarrollo

Durante el desarrollo se utilizará **Nodemon** para reiniciar automáticamente el servidor cuando se realicen cambios en el código.

Los comandos para iniciar el servidor se agregarán a medida que se configure la estructura del backend.

## Dependencias instaladas

### Dependencias de producción

```text
express
cors
dotenv
pg
```

### Dependencias de desarrollo

```text
nodemon
```

## Estructura

La estructura general propuesta para el backend es:

```text
backend/
├── src/
│   ├── controllers/
│   ├── models/
│   └── routes/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Importante

### `node_modules`

La carpeta `node_modules` no se debe subir a GitHub.

Cada integrante debe ejecutar:

```bash
npm install
```

después de clonar el proyecto.

### `.env`

El archivo `.env` tampoco debe subirse al repositorio, ya que puede contener información privada.

El archivo `.env.example` sirve como referencia para conocer las variables necesarias para ejecutar el proyecto.
