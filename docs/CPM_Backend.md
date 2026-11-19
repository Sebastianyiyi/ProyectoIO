# Backend CPM independiente

Base: `develop` de Sebastianyiyi/ProyectoIO, commit `5e7839e`.

El módulo nuevo se encuentra en `pert-backend/app/cpm/`:

| Archivo | Responsabilidad |
| --- | --- |
| `routes.py` | Endpoints de ejemplo y resolución CPM |
| `schema.py` | Duración fija, validaciones y contrato de resultados |
| `network.py` | Constructor AOA propio de CPM; E, L, holguras y compactación |
| `service.py` | Resolución, rutas críticas y estados de animación |
| `example.json` | Único ejercicio de ejemplo cargable |

En `app/main.py` solo se agregan la importación y el registro del router CPM.
La configuración, las rutas y la implementación PERT conservan su contenido
original, incluyendo sus respuestas, fórmulas, ejemplos y metadatos.

## API CPM

| Método | Ruta | Resultado |
| --- | --- | --- |
| GET | `/api/v1/cpm/example` | Un único ejemplo de cuatro actividades |
| POST | `/api/v1/cpm/solve` | Proyecto CPM resuelto |

No se agrega un selector ni un parámetro para elegir otros ejemplos públicos.

```json
{
  "activities": [
    {"id": "A", "predecessors": [], "duration": 3},
    {"id": "C", "predecessors": ["A"], "duration": 2},
    {"id": "B", "predecessors": ["A"], "duration": 4},
    {"id": "D", "predecessors": ["B", "C"], "duration": 5}
  ]
}
```

Resultado: **12 días**, ruta crítica **A → B → D**, holgura de C **2 días**.

CPM aplica `E_j = max(E_i + D_ij)`, `L_i = min(L_j - D_ij)` y
`H = L_j - E_i - D_ij`. Las actividades ficticias tienen duración cero.
La duración del proyecto se obtiene del evento final. Si hay varias rutas
críticas se enumeran hasta 100 y se informa cuando hay más.

Los otros dos ejercicios de las fotografías se conservan exclusivamente como
casos de prueba en `tests/fixtures/cpm_reference_exercises.json`; no se exponen
como ejemplos cargables. Las pruebas contrastan las duraciones 12, 22 y 26 días
y sus respectivas holguras.

La verificación adicional de PERT compara la respuesta completa del ejemplo
original con `tests/fixtures/pert_original_result.json`, capturada antes de
añadir el router CPM.
