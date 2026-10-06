# EcoBite Frontend

Frontend de EcoBite, una plataforma de delivery con enfoque sostenible.

## Stack

- **React** para construir la interfaz.
- **TypeScript** para el tipado estático.
- **Vite** como servidor de desarrollo y herramienta de build.
- **Tailwind CSS 4** para los estilos, integrado mediante el plugin de Vite.
- **React Router DOM** para la navegación entre pantallas.
- **Context API** como estrategia para compartir el estado del carrito. La
  implementación de `CartContext` todavía está pendiente.

## Requisitos

- Node.js 20.19+ o 22.12+
- pnpm

## Inicio rápido

Desde esta carpeta (`frontend`):

```bash
pnpm install
pnpm dev
```

Vite informa en la terminal la URL local para abrir la aplicación.

## Comandos

| Comando        | Uso                                                 |
| -------------- | --------------------------------------------------- |
| `pnpm dev`     | Inicia el servidor de desarrollo.                   |
| `pnpm build`   | Ejecuta TypeScript y genera el build de producción. |
| `pnpm lint`    | Ejecuta ESLint.                                     |
| `pnpm preview` | Sirve localmente el build generado.                 |

## Estructura

```text
src/
├── assets/       # Recursos gráficos
├── components/
│   ├── cart/     # Elementos del carrito
│   ├── checkout/ # Elementos del proceso de compra
│   ├── confirm/  # Elementos de confirmación del pedido
│   ├── footer/   # Pie de página
│   ├── login/    # Formulario de acceso
│   ├── navbar/   # Navegación principal
│   ├── restaurant/ # Listado, filtros y tarjetas de restaurantes
│   └── ui/       # Componentes de interfaz reutilizables
├── context/      # Contextos para estado compartido
├── layout/       # Estructuras compartidas de página
├── pages/        # Pantallas asociadas a las rutas
├── services/     # Acceso a datos y servicios
├── App.tsx       # Rutas de la aplicación
├── index.css     # Estilos globales y Tailwind
└── main.tsx      # Punto de entrada
```

## Componentes principales

- `Navbar`: navegación principal.
- `RestaurantCard`: tarjeta reutilizable de restaurante.
- `CartItem`: producto y controles de cantidad del carrito.
- `GreenBadge`: distintivo para destacar opciones ecológicas.

También hay componentes para filtros y listas de restaurantes, resumen del
carrito, checkout, confirmación e interfaz compartida.

## Datos y estado

`src/services/restaurants.ts` obtiene restaurantes con `fetch` desde
`GET /api/restaurants`. La conexión con el backend y la configuración del proxy
local están pendientes.

Context API es la opción elegida para el estado compartido del carrito; Redux no
se usará en este MVP. El archivo `src/context/CartContext.tsx` está creado, pero
el contexto todavía no está implementado.
