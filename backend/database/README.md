# Base de datos EcoBite

Esta carpeta contiene los archivos para recrear la base de datos de EcoBite en PostgreSQL.

## Archivos

* `ecobite.sql`: exportación en formato SQL Plain, que contiene la estructura de las tablas, las restricciones y los datos de prueba.
* `ecobite_backup.backup`: copia de seguridad en formato Custom, compatible con la opción **Restore** de pgAdmin.

## Opción 1: restaurar desde el archivo `.backup` (pgAdmin)

1. Abrir pgAdmin y conectarse al servidor PostgreSQL.
2. Crear una base de datos vacía llamada `ecobite`.
3. Hacer clic derecho sobre la base `ecobite` y seleccionar **Restore...**.
4. En **Filename**, seleccionar `ecobite_backup.backup`.
5. En **Format**, seleccionar `Custom` si la opción aparece.
6. Ejecutar **Restore** y esperar a que finalice.
7. Actualizar la vista de `Schemas → public → Tables` y comprobar que estén las tablas.

**Importante:** la base de destino debe estar vacía para evitar conflictos con tablas u objetos existentes.

## Opción 2: ejecutar el archivo `.sql`

El archivo `ecobite.sql` contiene la estructura y los datos exportados desde PostgreSQL.

Como la exportación utiliza bloques `COPY ... FROM stdin`, se recomienda ejecutarla con el cliente `psql`, en lugar de pegar o ejecutar el contenido directamente en Query Tool.

1. Crear una base de datos vacía llamada `ecobite`.

2. Ejecutar el siguiente comando desde la terminal cmd (windows+r --> cmd), reemplazando la ruta por la ubicación real del archivo y ajustando la ruta de `psql.exe` según la versión instalada(en este caso yo tenia la 18 ese numero se cambia segun la version que tengas):

   ```bash
   C:\> "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d ecobite -f "RUTA_COMPLETA/ecobite.sql"
   ```

3. Ingresar la contraseña del usuario (si tiene una) de PostgreSQL cuando se solicite. (Veras que no escribes nada pero si esta escribiendo)

4. Verificar que las tablas y los datos se hayan importado correctamente.

## Verificación

Después de restaurar o importar, comprobar que existan estas tablas, en schemas --> tables:

* `usuario`
* `cliente`
* `restaurante`
* `producto`
* `zona`
* `pedido`
* `detalle_pedido`

Los archivos incluyen datos de prueba para facilitar las pruebas del backend.

**Nota:** la contraseña de PostgreSQL es propia de cada integrante y no debe guardarse en estos archivos ni subirse al repositorio.
