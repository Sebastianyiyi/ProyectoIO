# PERT Backend

Backend en FastAPI para calcular y animar el método PERT. Toda la informacion se
procesa en memoria; no se usa base de datos.

## Requisitos

- Python 3.11 o superior
- Entorno virtual `venv` en `pert-backend/`

## Instalacion y ejecucion

```powershell
cd pert-backend
venv\Scripts\python.exe -m pip install -r requirements.txt
venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

La documentacion interactiva queda disponible en `http://127.0.0.1:8000/docs`.

## Endpoints

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| `GET` | `/health` | Estado del servicio |
| `GET` | `/api/v1/pert/example` | Proyecto de ejemplo |
| `POST` | `/api/v1/pert/solve` | Resuelve el proyecto PERT |

### Entrada

```json
{
  "activities": [
    {
      "id": "A",
      "name": "Definir requerimientos",
      "predecessors": [],
      "a": 1,
      "m": 2,
      "b": 3
    },
    {
      "id": "B",
      "name": "Disenar solucion",
      "predecessors": ["A"],
      "a": 2,
      "m": 3,
      "b": 4
    }
  ],
  "target_time": 8
}
```

Tambien se aceptan los alias `optimistic`/`optimista`, `most_likely`/`mas_probable`,
`pessimistic`/`pesimista` y `T` para `target_time`.

### Salida principal

- `project_duration`: duracion esperada del proyecto.
- `activities`: tiempo esperado, varianza, evento inicial/final, holgura y formula de cada actividad.
- `nodes`: eventos de la red AOA con `E`, `L`, coordenadas y estado critico.
- `edges`: actividades reales y ficticias (`is_dummy: true`) con etiqueta y holgura.
- `critical_path` y `critical_activities`.
- `probability`: media, varianza critica, desviacion estandar, `Z` y `P(T <= target_time)`.
- `steps`: snapshots ordenados para animar paso adelante, paso atras y ruta critica.

Cada paso incluye `type`, nodo evaluado, formula, explicacion en espanol,
etiquetas `E`/`L`, actualizaciones, nodos/arcos resaltados y un `snapshot`
acumulado para los botones Siguiente/Anterior del frontend.

## CORS

Por defecto se permiten `localhost` y `127.0.0.1` en los puertos `5173` y `3000`.
Se puede cambiar con la variable de entorno `PERT_ALLOWED_ORIGINS`, separando los
origenes por comas.

## Pruebas

```powershell
venv\Scripts\python.exe -m pytest -q
```
