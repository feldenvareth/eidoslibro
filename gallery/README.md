# Galería dinámica de Eidos

Esta versión elimina las listas de imágenes escritas a mano. Tanto `index.html` como `screen.html` leen automáticamente el contenido de `images/gallery/` mediante `api/images.php`.

## Uso

1. Sube esta carpeta a un servidor que ejecute PHP.
2. Copia o elimina imágenes dentro de `images/gallery/`.
3. Abre `index.html` para la galería o `screen.html` para el salvapantallas.
4. Recarga la página. No hay que modificar el código.

La lectura es recursiva: puedes ordenar las imágenes en subcarpetas. Se admiten JPG, JPEG, PNG, WEBP, GIF y AVIF.

## Importante

No funciona abriendo los archivos con doble clic (`file://`) ni en GitHub Pages, porque un navegador no puede enumerar por sí solo el contenido de una carpeta. Necesita un servidor con PHP. Para probarlo localmente:

```bash
php -S localhost:8000
```

Después abre `http://localhost:8000/`.

## Comportamiento

- La galería crea solo las celdas visibles y va recorriendo todas las imágenes, por lo que no intenta precargar cientos de archivos.
- Cada sustitución elige aleatoriamente entre 15 efectos.
- Al pulsar una imagen se abre el visor ampliado.
- El salvapantallas utiliza la misma carpeta, añade un fondo desenfocado dinámico y combina 12 transiciones.
- Los controles del salvapantallas desaparecen cuando no se mueve el ratón.
