# Base de datos EcoBite

Esta carpeta contiene los archivos necesarios para recrear la estructura de la base de datos de EcoBite en PostgreSQL.

Los archivos incluyen la definición de las tablas, relaciones y restricciones de la base de datos. **No contienen datos de prueba.**

## Archivos

- `ecobite.sql`: exportación en formato SQL Plain, que contiene la estructura de la base de datos.
- `ecobite_backup.backup`: copia de seguridad en formato Custom, compatible con la opción **Restore** de pgAdmin.

## Requisitos previos

- PostgreSQL instalado.
- Una herramienta para administrar PostgreSQL, como pgAdmin.
- Para importar el archivo `.sql`, se recomienda disponer del cliente `psql`, incluido en la instalación de PostgreSQL.

## Opción 1: restaurar desde el archivo `.backup` (pgAdmin)

1. Abrir pgAdmin y conectarse al servidor PostgreSQL.
2. Crear una base de datos vacía llamada `ecobite`.
3. Hacer clic derecho sobre la base de datos `ecobite` y seleccionar **Restore...**.
4. En **Filename**, seleccionar el archivo `ecobite_backup.backup`.
5. En **Format**, seleccionar `Custom` si la opción aparece.
6. Ejecutar **Restore** y esperar a que finalice.
7. Actualizar la vista de `Schemas → public → Tables` y comprobar que se hayan creado las tablas.

**Importante:** la base de destino debe estar vacía para evitar conflictos con tablas u objetos existentes.

## Opción 2: ejecutar el archivo `.sql`

El archivo `ecobite.sql` contiene la estructura de la base de datos en formato SQL.

Como la exportación utiliza bloques `COPY ... FROM stdin`, se recomienda ejecutarla con el cliente `psql`, en lugar de pegar o ejecutar el contenido directamente en Query Tool de pgAdmin.

1. Crear una base de datos vacía llamada `ecobite`.
2. Abrir la terminal de Windows (CMD).
3. Ejecutar el siguiente comando, reemplazando la ruta por la ubicación real del archivo y ajustando la ruta de `psql.exe` según la versión de PostgreSQL instalada:

```bash
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d ecobite -f "RUTA_COMPLETA\ecobite.sql"
```

En este ejemplo se utiliza PostgreSQL 18. El número de versión de la ruta debe coincidir con la versión instalada en el equipo.

4. Ingresar la contraseña del usuario de PostgreSQL cuando se solicite. Mientras se escribe, no se visualizarán los caracteres.
5. Verificar que la importación haya finalizado correctamente.

## Verificación

Después de restaurar o importar la estructura, comprobar en pgAdmin que las tablas se hayan creado dentro de `Schemas → public → Tables`.

Entre las tablas principales se encuentran:

- `usuario`
- `cliente`
- `restaurante`
- `horario_restaurante`
- `producto`
- `zona`
- `pedido`
- `detalle_pedido`
- `carrito`
- `detalle_carrito`

## Consideraciones

- Los archivos contienen la estructura de la base de datos, no registros de prueba.
- Cada integrante debe configurar sus propias credenciales de PostgreSQL.
- La contraseña de PostgreSQL y demás credenciales no deben guardarse en estos archivos ni subirse al repositorio.
- Para conectar el backend con la base de datos local, configurar las variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASSWORD` en el archivo `.env` del backend.
- Para el entorno de producción, el backend utiliza `DATABASE_URL`, configurada desde las variables de entorno del servicio desplegado.

