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
| TC-API-005 | POST sin `Content-Type: application/json` (form / text/plain) | 400 (o al menos no 500) | ❌ FAIL — **500** |

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

### BUG-002 — `bcrypt` no figura en `package.json` (Prioridad: Alta)
- `backend/src/server.js` → `usuario.model.js` hacen `require('bcrypt')`, pero `bcrypt`
  no está ni en `dependencies` ni en `package-lock.json`
- **Impacto:** un `npm install` / `npm ci` limpio **no instala bcrypt** → el servidor crashea
  al arrancar con `MODULE_NOT_FOUND`. Hubo que instalarlo manualmente para poder levantarlo.
- **Sugerencia:** `npm install bcrypt` (quedará registrado en package.json)

### Observación menor
- La rama `dev` no contiene `backend/src` — el código del backend solo está en `main`.
  Divergencia a alinear entre ramas.

## Cómo reproducir el entorno local

```bash
# DB (instalada vía scoop: scoop install postgresql)
pg_ctl start
createdb ecobite
psql -U postgres -d ecobite -f backend/database/ecobite.sql   # si falla por CREATE SCHEMA: DROP SCHEMA public CASCADE; antes

# Backend (extraído de origin/main en directorio temporal)
cd backend && npm install && npm install bcrypt
# .env: DB_HOST=localhost, DB_PORT=5432, DB_NAME=ecobite, DB_USER=postgres, DB_PASSWORD=
node src/server.js   # → http://localhost:3000
```
