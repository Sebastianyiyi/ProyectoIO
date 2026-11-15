# PERT Lab Frontend

Interfaz web didáctica para resolver, visualizar y animar proyectos con el método
PERT. Consume la API REST del backend en `pert-backend/` y no guarda datos: todo
el estado vive en memoria durante la sesión.

## Stack

- Vite 8
- React 19
- JavaScript/JSX
- Tailwind CSS 4
- Cytoscape.js + `cytoscape-node-html-label`
- `cytoscape-dagre` para el ordenamiento jerárquico de la red
- Lucide React
- Vitest + React Testing Library

## Requisitos

- Node.js 20.19 o superior
- Backend PERT corriendo en `http://127.0.0.1:8000`

## Instalación y ejecución

```powershell
cd pert-frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

## Variables de entorno

| Variable | Valor por defecto | Descripción |
| --- | --- | --- |
| `VITE_API_URL` | `http://127.0.0.1:8000` | URL base del backend PERT |

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Genera el build de producción en `dist/` |
| `npm run preview` | Sirve el build generado |
| `npm run lint` | Ejecuta Oxlint |
| `npm run test` | Ejecuta las pruebas una vez |
| `npm run test:watch` | Ejecuta las pruebas en modo watch |

## Estructura

```text
src/
├── api/          Cliente HTTP de la API PERT
├── components/   Formulario, resultados, grafo y controles
├── hooks/        Estado del proyecto, salud de la API y animación
├── lib/          Validación, formato, actividades y utilidades de Cytoscape
└── test/         Configuración de pruebas
```

## Flujo de la aplicación

1. Al abrir, consulta `/health` y carga el proyecto de ejemplo.
2. Envía el proyecto a `POST /api/v1/pert/solve`.
3. Muestra la red AOA ordenada con Dagre, con `E` arriba y `L` abajo de cada
   evento.
4. Permite navegar el grafo con zoom, arrastre y ajuste automático, y alternar
   entre visión global y enfoque del paso actual.
5. Permite avanzar, retroceder, reproducir, cambiar la velocidad y reiniciar los
   pasos del algoritmo desde el overlay superior derecho.
6. Organiza la experiencia en cuatro pasos: `Configuración`, `Red AOA y Datos`,
   `Resultados y Probabilidad` y `Resumen Ejecutivo`.
7. En `Configuración`, el selector de predecesores se abre en un menú flotante
   fuera de la tabla: se adapta al espacio disponible y abre hacia arriba en las
   últimas filas.
8. Los errores de validación y de conexión se muestran en un modal accesible, sin
   desplazar el formulario.
9. En `Red AOA y Datos`, el botón para mostrar u ocultar la tabla de actividades
   vive en la cabecera del lienzo, fuera del área del grafo.

## Configuración y resultados

- La tabla editable permite definir ID, nombre, predecesores y tiempos `a`, `m`,
  `b`, además del tiempo objetivo `T`.
- Los campos con errores se resaltan en la tabla; el modal resume los mensajes
  generales y permite reintentar cuando falla la API.
- Los resultados incluyen duración, ruta crítica, tabla de tiempos y holguras,
  valor `Z` y probabilidad acumulada.
- Los valores numéricos usan formato `es-CO` con coma decimal.

## Interacción con el grafo

- Rueda del ratón: zoom centrado en el cursor.
- Arrastrar: desplazar el lienzo.
- Botones de la cabecera: mostrar u ocultar la tabla de actividades, acercar,
  alejar y ajustar la red.
- Modo `Visión global`: muestra toda la red y resalta el paso actual.
- Modo `Enfoque`: atenúa los elementos que todavía no participan del cálculo.
- Overlay superior: leyenda a la izquierda, ruta crítica al centro y animación a
  la derecha.
- Las etiquetas `E` y `L` se muestran fuera del círculo; los arcos ajustan sus
  etiquetas y curvas para evitar cruces.
- Al reproducir los pasos, un tooltip flotante aparece junto al evento activo,
  escribe la fórmula con efecto máquina de escribir, la mantiene `1.5 s` a
  velocidad `1x` y se desvanece. Los tiempos se escalan con la velocidad de
  animación; el autoplay base es de `2.4 s` por paso.
- En pantallas pequeñas los overlays se apilan y el panel lateral queda debajo
  del grafo.

## Pruebas

```powershell
npm run test
npm run lint
npm run build
```
