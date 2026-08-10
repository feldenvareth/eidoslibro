# Auditoría del minijuego Evolución · EIDOS

Archivos auditados y corregidos:

- `evolucion_custodios_auditado.html`
- `evolution_custodians_audited.html`

## Alcance

- Movimiento y fusión del tablero 4×4.
- Fichas terminales de Vida no orgánica.
- Creación, orden y presentación de Custodios.
- Eramus y su nave SVG.
- Aparición aleatoria, retirada progresiva y compensación por paridad.
- Transiciones normales, compactas y pantallas encadenadas.
- Guardado, reanudación, Deshacer y récords del navegador.
- Equivalencia estructural español/inglés.
- HTML, CSS, JavaScript, accesibilidad básica, enlaces y Analytics.

## Fallos encontrados y corregidos

1. **Fin de partida después de crear un Custodio.** La pantalla del Custodio borraba la señal de tablero bloqueado. Ahora, al cerrarla, aparece automáticamente el final de partida.
2. **Breve desbloqueo entre avisos.** Entre dos Custodios consecutivos existía una ventana de 60 ms en la que podía aceptarse un movimiento. El tablero permanece bloqueado durante toda la cola.
3. **SVG oculto por la imagen.** El Custodio y la nave de Eramus podían quedar detrás de la imagen de fondo. Ahora se dibujan por encima, con contraste y resplandor.
4. **Último destello en móvil.** La miniatura del hito se revelaba y pulsaba mientras terminaba la transición compacta. Ahora se revela después de ocultar por completo la capa de transición y no hace ese segundo pulso en móvil.
5. **Migración del antiguo récord 4096.** En la versión anterior 4096 significaba EIDOS; en la nueva significa Vida no orgánica. Se ha creado una clave de récord nueva y se migra 4096 a EIDOS salvo que exista un récord real de Custodios.
6. **Récord incoherente al cargar.** La puntuación, la fase y el número de Custodios se reconcilian con el tablero guardado y se vuelven a almacenar.
7. **Partida guardada bloqueada.** Ya no se elimina silenciosamente. Al reanudarla se muestra su pantalla final con el resultado correcto.
8. **Enter borraba una partida guardada.** En la pantalla inicial, Enter ahora reanuda cuando existe una partida; solo inicia una nueva si no hay guardado.
9. **Contador susceptible a datos dañados.** El número actual de Custodios se deriva de las fichas terminales del tablero. Se validan las 16 casillas y sus valores antes de cargar.
10. **Control por teclado incompleto.** Enter/Espacio permiten continuar en EIDOS y en los avisos de Custodios, y reiniciar desde la pantalla final. El tablero es enfocable y tiene indicador visible.
11. **Carrera antes del final normal.** El tablero queda bloqueado durante la espera de apertura de la pantalla de fin de partida.

## Pruebas superadas

- Sintaxis de todos los bloques JavaScript con `node --check`.
- Parseo CSS sin errores.
- HTML sin identificadores duplicados.
- Todas las imágenes tienen atributo `alt`.
- Todos los enlaces con nueva pestaña conservan `noopener noreferrer`.
- Analytics y el consentimiento permanecen sin modificaciones.
- Misma lista de 67 funciones, constantes principales y eventos en español e inglés.
- 1.250 combinaciones exhaustivas de líneas con ceros, fichas normales y Custodios.
- 80.000 movimientos aleatorios comparados con un modelo independiente.
- Verificación de que dos Custodios nunca se fusionan.
- Verificación de bloqueo con un tablero completo de Custodios.
- Verificación de candidatos de aparición en los doce niveles.
- Verificación de las distribuciones y de la prioridad de compensación por paridad.
- Verificación de migración del antiguo récord 4096.

## Secuencia confirmada

1. Orfeo
2. Tessalon
3. IVN-3
4. Ciran
5. Kheron
6. Eramus — nave SVG
7. Kael
8. Eras
9. Lyron
10. Talion
11. Nemor
12. Sorel
13. Aster
14. Nexar
15. Veyron
16. Sael

El tablero solo tiene 16 casillas y los Custodios no se fusionan, por lo que 16 es también el máximo físico posible.

## Limitación de la auditoría

La lógica, estructura y sintaxis se han probado automáticamente. La percepción exacta de una animación depende del navegador, la tasa de refresco y el dispositivo; conviene hacer una última comprobación visual breve en el móvil donde se observó el parpadeo.
