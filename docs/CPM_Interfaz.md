# Pestañas independientes para PERT y CPM

La barra superior ofrece dos pestañas principales, **PERT** y **CPM**. Cada una
abre su propio espacio de trabajo. Al cambiar de método se conservan los datos
y los resultados de cada espacio durante la sesión.

## PERT

La pestaña PERT muestra el componente original `src/App.jsx`. Se conservan su
formulario, sus cuatro pasos, su ejemplo, la probabilidad y la presentación de
resultados. Sus archivos mantienen el contenido original de `develop`.

La nueva barra se coloca fuera de ese componente. Un estilo limitado al
contenedor adapta su alto al espacio disponible bajo la barra de métodos.

## CPM

La implementación nueva se concentra en `src/cpm/`:

1. **Configuración CPM:** ID, nombre, predecesores y una sola duración fija.
2. **Red AOA CPM:** grafo con E/L, ficticias y explicación del paso actual.
3. **Tiempos y holguras CPM:** tabla de actividades reales y ficticias y tiempos
   por evento, con `H = L_j - E_i - D_ij`.
4. **Resumen CPM:** duración y secuencias de las rutas críticas.

Existe un único botón **Cargar ejemplo CPM** y un único ejemplo público:
**A → B → D**, duración **12 días**. No hay un selector de ejercicios CPM.
El usuario puede ingresar y resolver sus propios proyectos.

CPM tiene formulario, estado, validación, cliente HTTP, lienzo y resumen propios.
Se reutilizan utilidades visuales genéricas y controles existentes sin editar sus
archivos. CPM se carga al abrir su pestaña por primera vez y conserva su estado
al alternar entre métodos. Su animación se pausa cuando se oculta la pestaña.

## Conexiones de entrada

Solo se modifican dos archivos originales para conectar el módulo:

- `pert-backend/app/main.py`: importar y registrar el router CPM.
- `pert-frontend/src/main.jsx`: montar el contenedor de las pestañas.

`src/App.jsx`, los componentes PERT, sus hooks, validaciones, servicios, rutas y
ejemplos permanecen iguales a la base. El control de contenido de los 101 archivos
originales restantes está en `PERT_Original_SHA256.json`.
