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

## Datos de restaurantes

Los listados y el detalle consumen `src/services/restaurants.ts`. Elegí la fuente
de datos en `.env.local` (podés crear el archivo copiando `.env.example`):

```env
VITE_DATA_SOURCE=mock
VITE_API_URL=http://localhost:3000/api
```

Con `VITE_DATA_SOURCE=mock`, la aplicación usa directamente los datos locales
definidos en `src/services/restaurants.ts`; no hace falta iniciar el backend.
Para conectarte a la API, cambiá el valor a `VITE_DATA_SOURCE=api` y configurá
`VITE_API_URL` con su URL base. Se esperan los endpoints `GET /restaurantes` y
`GET /restaurants/:slug/menu`; las respuestas deben coincidir con los tipos
`RestaurantApiResponse` y `RestaurantMenu` del servicio. Si la conexión falla,
se registra un error en la consola del navegador y la interfaz muestra el
mensaje de error; no se sustituyen los datos de la API por datos mock.

Después de crear o modificar `.env.local`, detené y volvé a iniciar Vite con
`pnpm dev` para que lea la configuración nueva. Los cambios en los datos mock
del archivo del servicio se reflejan al guardar, gracias a la recarga de Vite.

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


## Probar los datos mock

1. En `frontend/.env.local`, verificá que esté configurado:

   ```env
   VITE_DATA_SOURCE=mock
   ```

   Si modificás esta variable, reiniciá Vite con `pnpm dev`.
2. Abrí la URL que Vite muestra en la terminal y agregá estas rutas:

   - `/restaurantes`: listado mock con el filtro por tipo de comida.
   - `/restaurantes/verde-raiz`: detalle y menú de Verde Raiz.
   - `/restaurantes/hoja-y-fuego`: detalle y menú de Hoja y Fuego.

Por ejemplo, si Vite muestra `http://localhost:5173`, el listado estará en
`http://localhost:5173/restaurantes`. Los datos mock de restaurantes y menús
están definidos en `src/services/restaurants.ts`; no hace falta iniciar el
backend.

## Registro de cliente

El registro está en `/registro` y se completa en dos pasos:

1. **Crear cuenta:** elegir “Soy cliente”, ingresar email, contraseña,
   confirmación y canal de adquisición, y aceptar los términos.
2. **Completar perfil:** ingresar nombre, apellido, teléfono, dirección, ciudad
   y zona de domicilio. Piso y departamento son opcionales.

El frontend valida que el email tenga formato válido, que la contraseña tenga
al menos 8 caracteres, que ambas contraseñas coincidan y que se acepten los
términos. En el perfil, nombre y apellido no pueden contener números; el
teléfono no admite letras; piso y departamento aceptan solo números. Dirección,
ciudad y zona son obligatorias. Los errores de campo aparecen junto al campo y
los errores generales aparecen en un `GlobalAlert`.

Al guardar se realizan estas operaciones:

1. `POST /api/usuario/registro-cliente` crea la cuenta y devuelve el token.
2. `login()` guarda el token y el usuario en el contexto y `sessionStorage`; es
   una operación local, no una solicitud HTTP.
3. `POST /api/clientes` crea el perfil usando el token en `Authorization`.

Por eso el flujo genera **dos solicitudes al backend**. Si falla la creación
del perfil después de crear la cuenta, el formulario conserva la sesión para
permitir corregir los datos y reintentar sin volver a registrar el email.

### Errores del registro de cliente

- **Email duplicado (HTTP 409):** marca el email, muestra un `GlobalAlert` y
  vuelve al paso 1. Si ya tenés esa cuenta, podés iniciar sesión.
- **Datos inválidos:** muestra el mensaje específico junto al campo, por
  ejemplo, “El nombre no puede tener números” o “El piso solo puede contener
  números”.
- **Falla al guardar el perfil luego de crear la cuenta:** muestra “No pudimos
  guardar tu perfil. Tu cuenta ya está creada: revisá el campo marcado y probá
  de nuevo.” La sesión queda disponible para reintentar el perfil.
- **Error de conexión o del servidor:** muestra un `GlobalAlert` con el error
  recibido o un mensaje de conexión.

Las opciones de zona se envían como `id_zona` numérico: Centro (1), Norte (2),
Sur (3), Este (4) y Oeste (5). Estos IDs deben coincidir con los registros de
la tabla `zona` del backend.




