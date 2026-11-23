# Verificación de CPM en pestaña independiente

Base de referencia: `develop`, commit `5e7839e`.

| Comprobación | Resultado |
| --- | --- |
| Backend · pytest | 41 pruebas aprobadas |
| Frontend · Vitest | 89 pruebas aprobadas en 30 archivos |
| Frontend · Oxlint | Correcto |
| Frontend · Vite build | Compilación correcta |
| Contenido original conservado | 101 archivos idénticos a la base |
| Conexiones de entrada | Solo `app/main.py` y `src/main.jsx` |

## PERT conservado

Se verificó el contenido de todos los archivos originales respecto de la base.
Los 101 archivos ajenos a los dos puntos de entrada coinciden byte por byte,
incluidos `src/App.jsx`, su formulario, su cabecera, el motor de cálculo,
validaciones, rutas, animación, componentes de resultados y ejemplos.

La respuesta completa del ejemplo PERT original se compara con una referencia
capturada antes de integrar CPM. Se mantienen duración **11**, ruta
**A → B → E → F**, holguras, probabilidad, grafo y pasos.

En el backend, `main.py` agrega solo la importación y el registro de CPM. En el
frontend, `main.jsx` monta el contenedor nuevo de pestañas. La barra de métodos
y el ajuste del alto disponible se aplican desde archivos nuevos.

## CPM y ejemplo único

- Un solo endpoint de ejemplo público, sin parámetro de selección.
- Un solo botón de carga y ningún selector de ejercicios CPM en la interfaz.
- Formulario con ID, nombre, predecesores y duración fija.
- Duraciones decimales, cero, validaciones y actualización de referencias al renombrar.
- Red AOA compacta, E/L, holguras, ficticias y rutas críticas.
- Avance, retroceso y salto al estado final de la animación.
- Cambio entre pestañas conservando los datos propios de PERT y CPM.
- Navegación por teclado entre las pestañas.
- Conservación de la entrada del usuario cuando falla la API CPM.
- Grafo y distribución Dagre verificados con Cytoscape sin interfaz gráfica.

El ejemplo cargable entrega **12 días**, ruta **A → B → D** y holgura de C **2**.
Los otros dos ejercicios proporcionados se usan únicamente en pruebas del motor:

| Caso interno | Duración | Ruta crítica |
| --- | ---: | --- |
| Ejercicio 2 de las fotografías | 22 | A → B → D → E → G → H |
| Ejercicio 3 de las fotografías | 26 | B → C → D → E → I → J |

Se contrastan además 25 redes contra un cálculo independiente de tiempos por
actividad, revisando tiempos, holguras y precedencias. Se cubren ciclos,
duraciones inválidas, referencias incorrectas y múltiples rutas críticas.

Las pruebas de React se ejecutan en JSDOM y sustituyen el lienzo Canvas al
comprobar el flujo. La matemática del grafo y la distribución se prueban por
separado. La inspección visual final en Chrome corresponde a la ejecución del
paquete en el equipo del usuario; no se presenta como una prueba realizada aquí.

## Flujo Git entregado

1. Primer commit: motor y API CPM independientes, pruebas y documentación del backend.
2. Segundo commit: pestaña e interfaz CPM, pruebas del frontend y documentación de integración.

El paquete incluye los dos parches para reproducir estos commits en la rama
`feature/cpm-pestanas` usando la identidad de Git del usuario.

## Comandos de verificación en Windows

Desde `pert-backend`:

```powershell
.\venv\Scripts\python.exe -m pytest -q
```

Desde `pert-frontend`:

```powershell
npm run test
npm run lint
npm run build
```
