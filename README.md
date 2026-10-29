# ProyectoIO

Aplicación web didáctica para la resolución y visualización animada del método
PERT en la materia de Investigación de Operaciones.

## Estructura

- `pert-backend/`: API REST en FastAPI con el motor PERT, construcción de la red
  AOA, cálculo de tiempos, holguras, ruta crítica, probabilidad y snapshots para
  la animación. Ver [pert-backend/README.md](pert-backend/README.md).
- Frontend en JavaScript moderno (pendiente): React/Vite, Tailwind CSS y
  Cytoscape.js.

## Inicio rápido del backend

```powershell
cd pert-backend
venv\Scripts\python.exe -m pip install -r requirements.txt
venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

Documentación de la API: `http://127.0.0.1:8000/docs`.
