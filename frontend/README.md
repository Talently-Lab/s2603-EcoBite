# EcoBite Frontend

Frontend de EcoBite, una plataforma de delivery con enfoque sostenible.

## Stack

- **React** para construir la interfaz.
- **TypeScript** para el tipado estático.
- **Vite** como servidor de desarrollo y herramienta de build.
- **Tailwind CSS 4** para los estilos, integrado mediante el plugin de Vite.
- **React Router DOM** para la navegación entre pantallas.
- **Context API** para compartir el estado del carrito entre el menú, el
  encabezado y la página del carrito.

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
├── context/      # Contexto, proveedor y hook del carrito
├── layout/       # Estructuras compartidas de página
├── pages/        # Pantallas asociadas a las rutas
├── services/     # Acceso a datos y servicios
├── App.tsx       # Rutas de la aplicación
├── index.css     # Estilos globales y Tailwind
└── main.tsx      # Punto de entrada
```

## Componentes

```text
components/
├── cart/
│   ├── CartItem.tsx
│   ├── CartList.tsx
│   ├── CartSummary.tsx
│   ├── QuantitySelector.tsx
│   └── empty/
│       ├── EmptyCart.tsx
│       └── ZeroBadge.tsx
├── checkout/
│   ├── direction/
│   │   └── direction.tsx
│   └── method-page/
│       └── method-paage.tsx
├── confirm/
│   ├── ComparisonChart.tsx
│   ├── OrderDetails.tsx
│   └── SuccessIndicator.tsx
├── footer/
│   └── Footer.tsx
├── login/
│   └── LoginForm.tsx
├── navbar/
│   └── Navbar.tsx
├── restaurant/
│   ├── Banner.tsx
│   ├── FilterBar.tsx
│   ├── NoResults.tsx
│   ├── RestaurantCard.tsx
│   └── RestaurantList.tsx
└── ui/
    ├── AlertBanner.tsx
    ├── Badge.tsx
    ├── Button.tsx
    ├── EmptyIndicator.tsx
    ├── GreenBadge.tsx
    ├── ImpactBadge.tsx
    ├── Indicator.tsx
    ├── Logo.tsx
    ├── SectionTitle.tsx
    ├── SimpleCard.tsx
    └── StepIndicator.tsx
```

## Datos y estado

`src/services/restaurants.ts` obtiene restaurantes con `fetch` desde
`GET /api/restaurants`. La conexión con el backend y la configuración del proxy
local están pendientes.

El perfil y el menú del restaurante usan datos de ejemplo. Los platos se pueden
agregar al carrito, ajustar o quitar; el estado se comparte mediante Context API
y se mantiene mientras la aplicación está abierta. Redux no se usará en este
MVP. El catálogo real y la persistencia del carrito quedan pendientes.
