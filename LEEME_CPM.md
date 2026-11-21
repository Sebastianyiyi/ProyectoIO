# CPM con pestaña propia, un ejemplo y dos commits

Usa este paquete actualizado: **ProyectoIO_CPM_Pestanas.zip**.
Base: rama `develop` de `Sebastianyiyi/ProyectoIO`, commit `5e7839e`.

## Qué incluye

- Dos pestañas principales independientes: **PERT** y **CPM**.
- PERT conserva su interfaz, sus cálculos y su ejemplo originales.
- CPM tiene su propio formulario, red AOA, tablas, animación y resumen.
- Un único ejemplo cargable de CPM: cuatro actividades, **12 días**, ruta **A → B → D**.
- Dos parches para aplicar la integración y registrarla en dos commits propios.
- El proyecto completo como referencia y documentación en `docs/`.

Para trabajar con Git sobre tu clon actual, sigue el procedimiento de parches
de este documento. Los parches se aplican desde la carpeta de tu repositorio.
No copies primero los archivos del proyecto: los parches ya agregan cada cambio.

## 1. Detener los servicios y crear la rama

En las terminales de backend y frontend presiona **Ctrl + C**. Abre una terminal
de PowerShell en VS Code y ejecuta:

```powershell
Set-Location "C:\Users\ASUS\Desktop\Proyecto_IO"
git status --short
git switch develop
git pull --ff-only origin develop
git switch -c feature/cpm-pestanas
```

Estos pasos parten del clon que todavía no recibió los archivos del ZIP
anterior. `git status --short` debe mostrar un estado limpio para aplicar los
parches con el índice. Si hay cambios propios, consérvalos antes de continuar.

## 2. Indicar dónde está el paquete extraído

Extrae el ZIP actualizado en una carpeta aparte. Entra en la carpeta interior
`ProyectoIO_CPM_Pestanas`, donde están `parches`, `pert-backend` y `pert-frontend`.
Copia su ruta completa desde el Explorador. En la misma terminal ejecuta:

```powershell
$cpmPaquete = (Read-Host "Pega la ruta de la carpeta que contiene parches").Trim().Trim('"')
Test-Path (Join-Path $cpmPaquete "parches\01_backend_cpm.patch")
```

El último comando debe mostrar **True**. La terminal debe seguir ubicada en tu
repositorio `Proyecto_IO`; la variable señala la carpeta extraída.

## 3. Primer commit: motor y API CPM

```powershell
$cpmBackend = Join-Path $cpmPaquete "parches\01_backend_cpm.patch"
git apply --check --index $cpmBackend
if ($LASTEXITCODE -ne 0) { throw "El parche del backend no coincide con el estado actual. No se aplico." }
git apply --index $cpmBackend
if ($LASTEXITCODE -ne 0) { throw "No fue posible aplicar el backend CPM." }
git commit -m "feat(cpm): agrega motor y API independientes con un solo ejemplo"
if ($LASTEXITCODE -ne 0) { throw "Revisa el mensaje de Git antes de continuar con el segundo commit." }
```

Este commit agrega `app/cpm/`, sus pruebas y `docs/CPM_Backend.md`. En la aplicación
existente solo registra el router nuevo. `git apply --index` deja los archivos
del parche preparados para el commit y usa tu identidad configurada en Git.

## 4. Segundo commit: pestaña e interfaz CPM

```powershell
$cpmInterfaz = Join-Path $cpmPaquete "parches\02_interfaz_cpm.patch"
git apply --check --index $cpmInterfaz
if ($LASTEXITCODE -ne 0) { throw "El parche de interfaz no coincide con el estado actual. No se aplico." }
git apply --index $cpmInterfaz
if ($LASTEXITCODE -ne 0) { throw "No fue posible aplicar la interfaz CPM." }
git commit -m "feat(cpm): integra interfaz independiente mediante pestanas"
if ($LASTEXITCODE -ne 0) { throw "Revisa el mensaje de Git para completar el segundo commit." }
git log -2 --oneline
git status --short
```

Este commit agrega `src/cpm/`, cambia el punto de entrada `src/main.jsx` y agrega
la documentación de integración. El historial debe mostrar los dos commits y el
estado debe quedar limpio. Si Git pide configurar nombre y correo, utiliza tu
identidad de trabajo y repite el comando `git commit` pendiente.

## 5. Ejecutar y revisar

Las dependencias y los archivos de entorno existentes se conservan.

Terminal del backend:

```powershell
Set-Location "C:\Users\ASUS\Desktop\Proyecto_IO\pert-backend"
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

Terminal del frontend:

```powershell
Set-Location "C:\Users\ASUS\Desktop\Proyecto_IO\pert-frontend"
npm run dev
```

Abre `http://localhost:5173` y recarga con **Ctrl + F5**. Al inicio verás la
pestaña PERT. Selecciona **CPM** en la barra superior para abrir su interfaz.

El ejemplo CPM se carga al abrir la pestaña por primera vez. Puedes volver a
cargarlo con **Cargar ejemplo CPM**, editarlo o limpiar e ingresar otro proyecto.
Pulsa **Calcular CPM y continuar** y recorre sus cuatro pasos. El ejemplo debe
producir **12 días**, ruta **A → B → D** y holgura de C **2 días**.

Al volver a PERT, su interfaz, campos y resultados se mantienen. Su ejemplo
original conserva la duración de **11 unidades de tiempo** y la ruta **A → B → E → F**.

## 6. Subir la rama después de revisarla

Cuando termines de probar la actualización, desde la raíz del repositorio:

```powershell
git push -u origin feature/cpm-pestanas
```

Después puedes abrir el pull request con destino a `develop`.
La entrega del ZIP no publica cambios ni crea una rama remota por sí sola.

## Documentación y alcance

- `docs/CPM_Backend.md`: contrato, procedimiento y ejemplo único.
- `docs/CPM_Interfaz.md`: separación de pantallas y estructura.
- `docs/PERT_Original_SHA256.json`: control de contenido original conservado.
- `docs/PRUEBAS_CPM.md`: resultados de las verificaciones.

El ZIP contiene la copia completa del código y los dos parches. Los parches son
el procedimiento recomendado para actualizar tu clon y generar los commits.
Los otros dos ejercicios de las fotografías se usan solamente como pruebas
internas del motor; la interfaz CPM ofrece un único ejemplo cargable.
