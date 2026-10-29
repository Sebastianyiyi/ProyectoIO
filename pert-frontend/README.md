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
3. Muestra la red AOA con los tiempos `E` y `L` de cada evento.
4. Permite avanzar, retroceder, reproducir y reiniciar los pasos del algoritmo.
5. Presenta duración, ruta crítica, holguras y análisis probabilístico.

## Pruebas

```powershell
npm run test
npm run lint
npm run build
```
