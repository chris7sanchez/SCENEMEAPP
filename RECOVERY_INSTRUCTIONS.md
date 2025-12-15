# PROYECTO ANTIGRAVITY - KIT DE RECUPERACIÓN TOTAL

Este archivo contiene instrucciones para restaurar y ejecutar el proyecto "ANTIGRAVITY" en cualquier entorno de desarrollo, independientemente de Vercel.

## 1. Requisitos Previos (Prerequisites)

Para ejecutar este proyecto, necesitas tener instalado:
- **Node.js**: Versión 18.0.0 o superior recomendada.
- **npm**: Gestor de paquetes (generalmente incluido con Node.js).
- **Git**: (Opcional) Si deseas volver a inicializar el control de versiones.

## 2. Estructura del Proyecto

El archivo ZIP contiene:
- `src/`: Todo el código fuente (componentes, lógica, páginas).
- `public/`: Archivos estáticos (imágenes, iconos, fondos).
- `package.json`: Lista de dependencias y scripts.
- `next.config.ts`: Configuración del servidor Next.js.
- `tailwind.config.ts`: Configuración de estilos y diseño.
- `.env`: **IMPORTANTE** Variables de entorno y claves API. Mantén este archivo seguro.

## 3. Instrucciones de Instalación (Setup)

1.  **Descomprimir:** Extrae el contenido del archivo `.zip` en una carpeta nueva en tu ordenador.
2.  **Abrir Terminal:** Navega a esa carpeta usando tu terminal o línea de comandos.
    ```bash
    cd ruta/a/tu/carpeta/ANTIGRAVITY
    ```
3.  **Instalar Dependencias:** Ejecuta el siguiente comando para descargar todas las librerías necesarias.
    ```bash
    npm install
    ```

## 4. Ejecutar Localmente (Development)

Para abrir la aplicación en tu navegador web para editarla o verla:

```bash
npm run dev
```
Luego abre [http://localhost:3000](http://localhost:3000).

## 5. Construir para Producción (Build)

Si vas a subir esto a otro servidor (no dev):

```bash
npm run build
npm run start
```

## 6. Variables de Entorno (.env)

El archivo `.env` incluido ya tiene las configuraciones que estabas usando. 
**NOTA:** Si cambias de proveedor de base de datos o claves API (OpenAI, Meteo, etc.), edita este archivo.

## 7. Notas para Asistentes de IA

Si estás dando este proyecto a una nueva IA para que continúe el trabajo, dile lo siguiente:
> "Este es un proyecto Next.js con TypeScript y Tailwind CSS. La arquitectura utiliza el 'App Router'. El componente principal de la lógica astrológica y visual está en `src/components/antigravity/ScriptAnalyzer.tsx`."

---
*Generado automáticamente por Antigravity Cortex el 10 de Diciembre de 2025.*
