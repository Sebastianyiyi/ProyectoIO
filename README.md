# ProyectoIO

Aplicación web didáctica para la resolución y visualización animada del método
PERT en la materia de Investigación de Operaciones.

## Estructura

- `pert-backend/`: API REST en FastAPI con el motor PERT, construcción de la red
  AOA, cálculo de tiempos, holguras, ruta crítica, probabilidad y snapshots para
  la animación. Ver [pert-backend/README.md](pert-backend/README.md).
- `pert-frontend/`: interfaz en React con Vite, Tailwind CSS y Cytoscape.js.
  Incluye formulario de actividades, resultados, grafo AOA y controles de
  animación. Ver [pert-frontend/README.md](pert-frontend/README.md).

## Inicio rápido

### Backend

```powershell
cd pert-backend
venv\Scripts\python.exe -m pip install -r requirements.txt
venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

Documentación de la API: `http://127.0.0.1:8000/docs`.

### Frontend

En otra terminal:

```powershell
cd pert-frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

Aplicación web: `http://localhost:5173`.

## Pruebas

```powershell
cd pert-backend
venv\Scripts\python.exe -m pytest -q

cd ..\pert-frontend
npm run test
npm run lint
npm run build
```
