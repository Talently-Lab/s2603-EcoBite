# Testing de API Inicial — Backend EcoBite

- **Fecha:** 2026-10-15
- **QA:** hevie
- **Entorno:** local — PostgreSQL 18.6 (scoop), backend desde `origin/main` (7530294), Node 24, `http://localhost:3000`
- **Herramientas:** Postman (colección `docs/qa/postman/ecobite-api-qa-inicial.postman_collection.json`), curl

> Nota: la ruta de registro **no** es `/api/users/register` como decía la consigna.
> Rutas reales: `POST /api/usuario/registro-cliente` y `POST /api/usuario/registro-restaurante`.

## Casos ejecutados

| TC | Descripción | Esperado | Resultado |
|----|-------------|----------|-----------|
| TC-API-001 | Registro cliente **sin `email`** | 400 con error claro | ✅ PASS — `400 {"error":"Faltan datos obligatorios"}` |
| TC-API-003 | Registro cliente body `{}` | 400 | ✅ PASS — `400 {"error":"Faltan datos obligatorios"}` |
| TC-API-004 | Registro cliente datos válidos | 201, sin exponer contraseña | ✅ PASS — `201 Created` |
| TC-API-005 | POST sin `Content-Type: application/json` (form / text/plain) | 400 (o al menos no 500) | ❌ FAIL — **500** (BUG-001) |
| TC-API-006 | Registro cliente con **email ya registrado** | 409 | ❌ FAIL — **500** (BUG-002) |
| TC-API-007 | Registro cliente con JSON inválido (`{bad json`) | 400 | ✅ PASS — `400` |
| TC-API-008 | GET /api/usuario/:id con id no numérico | 400 | ✅ PASS — `400` |

**Respuesta de la consigna principal:** el servidor devuelve **400 claro**, no se cae con 500.
La validación `if (!email || !contrasena || !canal_adquisicion)` está en
`backend/src/models/usuario.model.js` y ocurre **antes** de tocar la base, por lo que
el INSERT nunca se ejecuta con datos incompletos.

## Hallazgos / Bugs

### BUG-001 — 500 al enviar el body sin `Content-Type: application/json` (Prioridad: Alta)
- **Ruta:** `POST /api/usuario/registro-cliente` (probablemente igual en el resto)
- **Pasos:** enviar la petición con body `email=foo@bar.com` y `Content-Type: application/x-www-form-urlencoded` o `text/plain`
- **Esperado:** 400 con mensaje de error claro
- **Obtenido:** `500 {"error":"Error interno al registrar el usuario"}`
- **Causa raíz:** `express.json()` no parsea el body → `req.body` es `undefined` →
  `const { email, ... } = usuario` en `usuario.model.js` lanza
  `TypeError: Cannot destructure property 'email' of 'usuario' as it is undefined.`
- **Sugerencia:** validar `if (!req.body)` → 400, o usar `express.json({ strict: false })` + middleware que responda 400 ante body no-JSON
- **Evidencia:** `docs/qa/evidencias/bug-001-500-sin-content-type.png`

### BUG-002 — Email duplicado devuelve 500 en `registro-cliente` (Prioridad: Alta)
- **Ruta:** `POST /api/usuario/registro-cliente`
- **Pasos:** registrar un email dos veces con datos válidos
- **Esperado:** `409 Conflict` — `{"error":"Ese email ya está registrado"}`
- **Obtenido:** `500` — `{"error":"Error interno al registrar el usuario"}`
  (`duplicate key value violates unique constraint "usuario_email_key"`)
- **Causa raíz:** la ruta `registro-cliente` en `server.js` solo maneja
  `error.message === 'Faltan datos obligatorios'`; **no valida `error.code === '23505'`**,
  a diferencia de `registro-restaurante` que sí devuelve 409 en el mismo escenario.
- **Impacto:** el frontend no puede distinguir "email ya registrado" de un error interno →
  no puede mostrar el mensaje en el formulario de registro.
- **Sugerencia:** copiar el manejo de `registro-restaurante`:
  `if (error.code === '23505') return res.status(409).json({ error: 'Ese email ya está registrado' });`
- **Evidencia:** `docs/qa/evidencias/bug-002-500-email-duplicado.png`

### Corrección (descartado)
- Se había reportado que `bcrypt` faltaba en `package.json`: **era falso**. La comparación
  se hizo contra la rama `dev` (que tiene un `package.json` de backend desactualizado y sin
  `src/`); `main` **sí** incluye `bcrypt: ^6.0.0` y el servidor arranca con `npm install` normal.

### Observación menor
- La rama `dev` no contiene `backend/src` y su `backend/package.json` no incluye `bcrypt`
  (divergencia con `main`). El código del backend solo vive en `main`.

## Cómo reproducir el entorno local

```bash
# DB (instalada vía scoop: scoop install postgresql)
pg_ctl start
createdb ecobite
psql -U postgres -d ecobite -f backend/database/ecobite.sql   # si falla por CREATE SCHEMA: DROP SCHEMA public CASCADE; antes

# Backend (extraído de origin/main en directorio temporal)
cd backend && npm install
# .env: DB_HOST=localhost, DB_PORT=5432, DB_NAME=ecobite, DB_USER=postgres, DB_PASSWORD=
node src/server.js   # → http://localhost:3000
```

## Evidencias (docs/qa/evidencias/)

| Archivo | Contenido |
|---------|-----------|
| `2026-10-15-testing-api-inicial.txt` | Respuestas HTTP crudas de los 4 casos originales (curl -i) |
| `bug-001-500-sin-content-type.png` | Captura del bug 001: request, respuesta 500, log y causa raíz |
| `bug-002-500-email-duplicado.png` | Captura del bug 002: request, 500 vs 409 esperado, contraste y causa raíz |
