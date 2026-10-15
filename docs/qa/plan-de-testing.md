# Plan de Testing — EcoBite

La documentación de testing del proyecto está centralizada en Google Drive:

*[Insertar enlace a la carpeta de Google Drive] — "Acceder a la carpeta de Testing — EcoBite"*

| Documento | Descripción |
|-----------|-------------|
| **Plan de Testing** | Alcance, estrategia, tipos de prueba, recursos, cronograma y criterios de entrada/salida. |
| **Casos de Prueba** | Pasos, datos de prueba y resultados esperados para cada funcionalidad. |
| **Reportes de Bugs** | Incidentes detectados durante la ejecución y su seguimiento. |

---

## Documentación de testing en el repositorio

Ejecuciones, informes y evidencias viven en [`docs/qa/`](./):

| Archivo | Descripción |
|---------|-------------|
| [`testing-api-inicial-2026-10-15.md`](./testing-api-inicial-2026-10-15.md) | Informe del testing de API inicial: casos ejecutados, resultados y hallazgos. |
| [`postman/ecobite-api-qa-inicial.postman_collection.json`](./postman/ecobite-api-qa-inicial.postman_collection.json) | Colección de Postman con los casos de la API de registro (tests automáticos incluidos). |
| [`evidencias/2026-10-15-testing-api-inicial.txt`](./evidencias/2026-10-15-testing-api-inicial.txt) | Respuestas HTTP crudas de los casos ejecutados (curl -i). |
| [`evidencias/bug-001-500-sin-content-type.png`](./evidencias/bug-001-500-sin-content-type.png) | Captura de evidencia BUG-001. |
| [`evidencias/bug-002-500-email-duplicado.png`](./evidencias/bug-002-500-email-duplicado.png) | Captura de evidencia BUG-002. |

---

## Estado de hallazgos

| ID | Descripción | Prioridad | Estado |
|----|-------------|-----------|--------|
| BUG-001 | 500 al enviar el body sin `Content-Type: application/json` (esperado 400) | Alta | Abierto — pendiente de cargar en Trello |
| BUG-002 | Email duplicado devuelve 500 en `registro-cliente` (esperado 409) | Alta | Abierto — pendiente de cargar en Trello |

---

## Cómo usar la colección de Postman

1. Abrir Postman → **Import** → seleccionar `docs/qa/postman/ecobite-api-qa-inicial.postman_collection.json`.
2. La variable `base_url` apunta a `http://localhost:3000` por defecto; cambiarla a la URL de prueba cuando Backend la comparta.
3. Correr la colección: los tests validan automáticamente status esperado y mensajes de error.

---

*EcoBite - FoodTech | 2026 — QA*
