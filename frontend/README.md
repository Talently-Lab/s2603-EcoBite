# EcoBite Frontend

Frontend de la plataforma de delivery sostenible EcoBite. El proyecto usa React,
TypeScript, Vite y Tailwind CSS 4.

## Requisitos

- Node.js 20.19+ o 22.12+
- pnpm

## Inicio rapido

Desde esta carpeta (`frontend`):

```bash
pnpm install
pnpm dev
```

Vite muestra en la terminal la URL local para abrir la aplicacion.

## Comandos

| Comando        | Uso                                                 |
| -------------- | --------------------------------------------------- |
| `pnpm dev`     | Inicia el servidor de desarrollo.                   |
| `pnpm build`   | Ejecuta TypeScript y genera el build de produccion. |
| `pnpm lint`    | Ejecuta ESLint.                                     |
| `pnpm preview` | Sirve localmente el build generado.                 |

## Estructura actual

```text
src/
├── assets/                 # Recursos graficos
├── components/             # Navbar, RestaurantCard, CartItem y GreenBadge
│   └── laytout/
│   └── ui/                 # Componentes de interfaz compartidos
├── context/                # Estado compartido; CartContext esta pendiente
├── pages/                  # HomePage
├── services/               # Acceso a datos; restaurantes
├── App.tsx
├── index.css
└── main.tsx
```

Los tipos de TypeScript se mantienen cerca del componente o servicio que los
utiliza; no hay un directorio global `types`.

## Stack para el MVP (definido)

- **React + Vite:** base de la aplicacion.
- **TypeScript:** tipado estatico; los tipos se mantienen junto al codigo que
  los utiliza.
- **Tailwind CSS 4:** estilos utilitarios, integrado con el plugin de Vite.
- **Context API:** opcion elegida para compartir el estado del carrito. Redux
  no es necesario para el alcance inicial; `CartContext` aun esta pendiente.
- **React Router DOM:** dependencia instalada; falta configurar las rutas de
  las pantallas.
- **fetch:** usado por `src/services/restaurants.ts` para consultar
  `GET /api/restaurants`. La conexion con el backend y el proxy local quedan
  pendientes.

## Estado

La base de Vite, Tailwind y la primera pagina estan preparadas. La estructura de
componentes es inicial: falta conectarla a los wireframes, implementar el estado
del carrito y consumir los datos reales de la API.
