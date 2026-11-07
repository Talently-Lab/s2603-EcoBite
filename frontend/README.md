# EcoBite Frontend

Frontend de EcoBite, una plataforma de delivery con enfoque sostenible.

## Stack

- **React** para construir la interfaz.
- **TypeScript** para el tipado estático.
- **Vite** como servidor de desarrollo y herramienta de build.
- **Tailwind CSS 4** para los estilos, integrado mediante el plugin de Vite.
- **React Router DOM** para la navegación entre pantallas.
- **Context API** (`CartContext`) para compartir el carrito entre
  el menú, el encabezado, la página del carrito y el checkout.

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
`VITE_API_URL` con su URL base. Se usan `GET /api/restaurantes` y
`GET /api/restaurantes/:id/productos`; los productos del backend se agrupan en
platos y bebidas según su categoría. Si la conexión falla,
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
├── contexts/     # Contextos de autenticación y carrito
├── layouts/      # Estructuras compartidas de página
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

`src/services/restaurants.ts` obtiene restaurantes y menús desde el backend
cuando `VITE_DATA_SOURCE=api`; con `VITE_DATA_SOURCE=mock` usa los datos locales.
Para registro, carrito y pedidos hay que usar el modo `api` y tener el backend
disponible en `VITE_API_URL`.

`src/contexts/CartContext.tsx` mantiene en el frontend el estado compartido del
carrito. En modo `api`, los cambios se sincronizan con los endpoints de
`/carritos`; en modo `mock`, el estado se mantiene localmente. El encabezado
muestra la cantidad total; la página del carrito permite cambiar cantidades,
quitar productos y abandonar carritos.

### Pedidos y calificaciones

Con el backend disponible y `VITE_DATA_SOURCE=api`, los clientes autenticados
pueden consultar sus pedidos desde **Mis pedidos**, en el menú de usuario. La
página usa `GET /api/ordenes/mis-pedidos` y muestra la acción para calificar
cuando el pedido está entregado. La calificación de 1 a 5 estrellas se envía
con `PATCH /api/ordenes/:id/calificar`.


## Probar los datos mock

1. En `frontend/.env.local`, verificá que esté configurado:

   ```env
   VITE_DATA_SOURCE=mock
   ```

   Si modificás esta variable, reiniciá Vite con `pnpm dev`.
2. Abrí la URL que Vite muestra en la terminal y agregá estas rutas:

   - `/restaurantes`: listado mock con el filtro por tipo de comida.
   - `/restaurantes/verde-raiz`: detalle y menú de Verde Raíz.
   - `/restaurantes/hoja-y-fuego`: detalle y menú de Hoja y Fuego.

Por ejemplo, si Vite muestra `http://localhost:5173`, el listado estará en
`http://localhost:5173/restaurantes`. Los datos mock de restaurantes y menús
están definidos en `src/services/restaurants.mock.ts`; no hace falta iniciar el
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

## Registro de restaurante

El registro también está en `/registro` y tiene dos pasos:

1. **Crear cuenta y completar datos del local:** elegir “Soy restaurante” e
   ingresar email, contraseña, confirmación, canal de adquisición, aceptar los
   términos, nombre del local, CUIT y categoría. Teléfono, dirección,
   descripción, ciudad e imagen son opcionales.
2. **Configurar horarios:** activar los días abiertos y cargar uno o dos turnos
   por día. Debe haber al menos un día abierto; cada turno debe cerrar después
   de su apertura. Los horarios se muestran en la tarjeta del restaurante.

Al enviar el paso 2, el frontend ejecuta este flujo autenticado:

1. `POST /api/usuario/registro-restaurante` crea la cuenta y devuelve un token.
2. `POST /api/restaurantes` crea el perfil con nombre, CUIT y categoría, más
   los campos opcionales informados.
3. `PATCH /api/restaurantes/:id/imagen` sube la imagen si se seleccionó.
4. `POST /api/restaurantes/:id/horarios` guarda los turnos.

Si falla la creación del perfil o de los horarios, el formulario conserva la
sesión y los datos del registro para reintentar sin volver a crear la cuenta.
Si la imagen falla, el perfil y los horarios pueden completarse igual; la
pantalla de éxito muestra el error y ofrece reintentar la carga.

### Errores del registro de restaurante

- **Email ya registrado (HTTP 409):** muestra el error junto al email y vuelve
  al paso 1 para revisar los datos o iniciar sesión.
- **CUIT ya registrado:** marca el campo CUIT y vuelve al paso 1 para corregirlo.
- **Datos requeridos o formato incorrecto:** señala el campo correspondiente;
  el CUIT debe tener 11 números y el teléfono opcional no puede incluir letras.
- **Horarios inválidos:** muestra un `GlobalAlert` y marca los turnos que hay que
  corregir. Hace falta al menos un turno válido y el cierre debe ser posterior
  a la apertura.
- **Falla de conexión o del servidor:** muestra el error y conserva la sesión
  pendiente para reintentar el paso que no se pudo completar.
- **Error al subir imagen:** no invalida el registro; se puede reintentar desde
  la pantalla de éxito.

## Flujo del carrito y checkout

Para sincronizar el carrito y crear pedidos se requiere una sesión autenticada
con rol `cliente` y `VITE_DATA_SOURCE=api`:

1. Desde el menú se agregan productos al estado global del carrito. Cada ítem
   conserva el ID del producto, el restaurante y la cantidad.
2. En checkout se ingresan dirección, ciudad, zona y forma de pago.
3. Al confirmar, el frontend envía un `POST /api/ordenes` por carrito/restaurante.
   El backend requiere `id_carrito`, `id_zona` y `tipo_pago`; también se envían
   los datos de entrega (`direccion_entrega`, `piso_entrega`,
   `departamento_entrega`, `indicacion_entrega`) y `costo_envio` si corresponde.
   La implementación agrega además `id_restaurante` y `productos` como datos
   auxiliares, pero el backend crea el pedido a partir del carrito indicado por
   `id_carrito`. Las zonas son Centro (1), Norte (2), Sur (3), Este (4) y Oeste
   (5); los medios se traducen a `tarjeta` o `efectivo`.
4. El backend valida el carrito, los productos y la zona, calcula los importes
   con los precios de la base y devuelve `{ mensaje, pedido }`. Si se crea el
   pedido, se muestra el modal de éxito y la confirmación presenta los productos
   comprados.

Los errores de confirmación aparecen en un `GlobalAlert`, por ejemplo si no hay
sesión de cliente, el restaurante o la zona no existen, un producto no está
disponible o no pertenece al restaurante indicado.

## Referencia de endpoints consumidos por el frontend

Todas las rutas siguientes se concatenan con `VITE_API_URL` (por ejemplo,
`http://localhost:3000/api`). Las rutas protegidas envían
`Authorization: Bearer <token>`; el token de sesión se guarda en
`sessionStorage`. Para probar estos flujos con la API, configurá
`VITE_DATA_SOURCE=api` y reiniciá Vite.

### Autenticación y registro

| Método y ruta | Quién / uso | Datos enviados | Datos utilizados de la respuesta |
|---|---|---|---|
| `POST /usuario/login` | Inicio de sesión, cliente o restaurante | JSON `{ "email": "...", "contrasena": "..." }` | `token` y `usuario` (`id`, `email`, `rol` y, si está disponible, nombre/ciudad). |
| `POST /usuario/registro-cliente` | Registro de cliente | `email`, `contrasena`, `canal_adquisicion` | `token` y `usuario`; la aplicación inicia sesión con ellos. |
| `POST /clientes` | Crear perfil de cliente después del registro | `nombre`, `apellido`, `telefono`, `direccion`, `piso`, `departamento`, `ciudad`, `id_zona` | `cliente.nombre` y `cliente.apellido`. |
| `POST /usuario/registro-restaurante` | Registro de restaurante | `email`, `contrasena`, `canal_adquisicion` | `token` y `usuario`; la aplicación inicia sesión con ellos. |
| `POST /restaurantes` | Crear perfil del restaurante | `nombre`, `cuit`, `categoria`; opcionalmente `telefono`, `direccion`, `descripcion`, `ciudad` | `restaurante.id`, necesario para configurar el resto del perfil. |
| `PATCH /restaurantes/:id/imagen` | Subir imagen de restaurante | `multipart/form-data`, campo `imagen` con el archivo | URL `imagen`. |
| `POST /restaurantes/:id/horarios` | Guardar horarios al registrar el restaurante | JSON `{ "horarios": [{ "dia_semana", "hora_apertura", "hora_cierre" }] }` | Se verifica el estado HTTP; no se usa un objeto de respuesta. |

El frontend **no consume** `GET /usuario/perfil`,
`GET /prueba/restaurante`, ni rutas de edición o eliminación de usuario. La
sesión se obtiene del login/registro y se mantiene en el contexto de autenticación.
En modo `VITE_DATA_SOURCE=mock`, el inicio de sesión usa cuentas locales y no
llama a `POST /usuario/login`.

### Restaurantes, menús y productos

| Método y ruta | Uso | Datos enviados / utilizados |
|---|---|---|
| `GET /restaurantes` | Listado y búsqueda de restaurantes | Sin cuerpo. Se usan IDs, nombre, dirección, categoría, ciudad, imagen y datos asociados para formar las tarjetas. |
| `GET /restaurantes/:id/productos` | Menú público del restaurante | Sin cuerpo. Se usan `id`, `nombre`, `descripcion`, `precio`, `disponible`, `categoria` e `imagen`. Si la respuesta incluye productos no disponibles, se muestran con esa etiqueta y sin permitir agregarlos al carrito. |
| `POST /productos` | Crear producto desde el panel del restaurante | Requiere token. JSON con `id_restaurante`, `nombre`, `descripcion`, `precio` y `categoria`. Se usa `producto` de la respuesta. |
| `PATCH /productos/:id` | Habilitar o deshabilitar un plato desde Productos | Requiere token del propietario. JSON `{ "disponible": true }` o `{ "disponible": false }`; se actualiza el estado desde el producto devuelto. |
| `GET /restaurantes/:id/productos/gestion` | Listar productos administrables en el panel | Requiere token de restaurante/administrador. Se usa la lista `productos`. |
| `GET /restaurantes/:id/estado` | Mostrar si el restaurante está abierto | Sin cuerpo. Se usa el booleano `abierto`. |
| `GET /restaurantes/:id/horarios` | Cargar horarios en la página Horarios del panel | Requiere token del restaurante propietario. Se usa `horarios` con ID, día y horas. |
| `POST /restaurantes/:id/horarios` | Guardar el calendario semanal completo | Requiere token del restaurante propietario. JSON `{ "horarios": [{ "dia_semana", "hora_apertura", "hora_cierre" }] }`; reemplaza el conjunto existente. |

La ruta pública de productos del backend actualmente filtra los platos con
`disponible = false`; por eso el menú no puede mostrarlos como “No disponible”
hasta que esa ruta incluya también esos productos. El menú ya respeta ese estado
cuando viene en la respuesta.

La página Horarios reutiliza el selector de días y turnos del registro. `PUT
/restaurantes/:id/horarios/:idHorario` y
`DELETE /restaurantes/:id/horarios/:idHorario` también tienen funciones en
`src/services/horarios.ts`, aunque la página actual guarda el calendario entero
con `POST`.

### Carritos

Los seis endpoints de carritos se consumen desde `src/services/cart.ts`, a través
de `src/contexts/CartContext.tsx`. Todos requieren token y rol `cliente`.

| Método y ruta | Cuándo se usa | Datos enviados | Datos leídos |
|---|---|---|---|
| `GET /carritos` | Cargar carritos del cliente al iniciar/sincronizar el carrito | Sin cuerpo | `carritos`; se conservan los de estado `pendiente`. |
| `GET /carritos/:idCarrito` | Cargar los productos de cada carrito pendiente | ID en la ruta | `carrito` y `productos`; de los productos se usan ID, nombre, cantidad, precio, imagen y restaurante. |
| `POST /carritos/:idRestaurante/productos` | Agregar producto; el backend crea el carrito pendiente si hace falta | JSON `{ "productoId": <id>, "cantidad": 1 }` | El frontend vuelve a pedir la lista y los detalles para sincronizar. |
| `PATCH /carritos/:idCarrito/productos/:idProducto` | Cambiar cantidad | JSON `{ "cantidad": <entero positivo> }` | El frontend vuelve a sincronizar el carrito. |
| `DELETE /carritos/:idCarrito/productos/:idProducto` | Quitar producto | IDs en la ruta; sin cuerpo | El frontend vuelve a sincronizar el carrito. |
| `DELETE /carritos/:idCarrito` | Abandonar un carrito o vaciar todos los carritos pendientes | ID en la ruta; sin cuerpo | El frontend vuelve a sincronizar el carrito. |

### Pedidos

| Método y ruta | Quién / cuándo | Datos enviados | Datos utilizados |
|---|---|---|---|
| `POST /ordenes` | Cliente confirma compra | `id_carrito`, `id_zona`, `tipo_pago` (`efectivo` o `tarjeta`), `direccion_entrega`; opcionales `piso_entrega`, `departamento_entrega`, `indicacion_entrega`, `costo_envio`. El frontend también adjunta `id_restaurante` y `productos`, aunque el backend actual arma el pedido desde `id_carrito`. | `pedido` de la respuesta; el backend calcula totales y `co2_ahorrado`. La confirmación suma el CO₂ de los pedidos creados. |
| `GET /ordenes/mis-pedidos` | Cliente abre “Mis pedidos” | Sin cuerpo | `id`, `restaurante`, `estado`, `forma_pago`, `total`, `co2_ahorrado`, `fecha_creacion`. La respuesta actual **no incluye `calificacion`**. |
| `GET /ordenes/:id/detalle` | Cliente pulsa “Ver detalle” en Mis pedidos | ID en la ruta; requiere token del cliente propietario | `detalles` con nombre del producto, cantidad, precio unitario y subtotal; además del costo de envío y total. Se presenta en un modal. |
| `PATCH /ordenes/:id/recibido` | Cliente confirma recepción cuando el estado es `despachado` | ID en la ruta; sin cuerpo | Mensaje y pedido actualizado; el frontend actualiza el estado a `entregado`. |
| `PATCH /ordenes/:id/calificar` | Cliente califica pedido entregado | JSON `{ "calificacion": 1 }` a `{ "calificacion": 5 }` | El frontend muestra confirmación al tener éxito. Una calificación existente no se puede volver a enviar. |
| `PATCH /ordenes/:id/cancelar` | Cliente cancela pedido `pendiente` o `en_preparacion` | ID en la ruta; sin cuerpo | `pedido.estado_pedido`, que puede ser `cancelado` o `cancelado_demora` según las reglas del backend. |
| `PATCH /ordenes/:id/no-entregado` | Cliente informa que no recibió un pedido `despachado` | ID en la ruta; sin cuerpo | `pedido.estado_pedido` (`no_entregado`). |
| `PATCH /ordenes/:id/aceptar` | Restaurante acepta un pedido pendiente | ID en la ruta; sin cuerpo | Éxito/error; el panel vuelve a cargar estadísticas. |
| `PATCH /ordenes/:id/rechazar` | Restaurante rechaza un pedido pendiente | ID en la ruta; sin cuerpo | Éxito/error; el panel vuelve a cargar estadísticas. |
| `PATCH /ordenes/:id/despachar` | Restaurante despacha un pedido en preparación | ID en la ruta; sin cuerpo | Éxito/error; el panel vuelve a cargar estadísticas. |

`GET /ordenes/:id/detalle`, `GET /ordenes/restaurante/mis-pedidos` y
`GET /ordenes/restaurante/:id/detalle` existen en el backend, pero el frontend
actual no los llama. Los pedidos del panel del restaurante provienen de
`GET /dashboard/stats`.

### Dashboard del restaurante

`GET /dashboard/stats?mes=AAAA-MM` requiere el token de restaurante. El selector
del dashboard envía el mes y la interfaz muestra la respuesta real del campo
`estadisticas`:

- `pedidos_recibidos`, `ventas_entregadas` y `co2_total_ahorrado`, con sus
  variaciones (`porcentaje` y `direccion`).
- `pedidos_por_estado`: `estado_pedido` y `cantidad_pedidos`.
- `ventas_por_dia`: `dia` y `ventas_del_dia`.
- `productos_mas_vendidos`: `producto` y `unidades_vendidas`.
- `calificaciones`: `calificacion_promedio` y `total_calificaciones`.
- `distribucion_calificaciones`: calificación y cantidad.
- `ultimos_pedidos`: número, cliente, estado, forma de pago, total y hora de
  aceptación.

Mientras espera esta solicitud el dashboard muestra skeletons y un spinner; si
falla, muestra el error y permite reintentar. El backend calcula las métricas
para el restaurante autenticado y el mes solicitado.
