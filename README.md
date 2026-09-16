# 🎙️ 100 Cristianos Dijeron - Juego Familiar para Iglesias

¡Bienvenido a **100 Cristianos Dijeron**! Este es un juego interactivo de estilo *Family Feud* adaptado con temáticas y preguntas cristianas, diseñado especialmente para dinámicas de grupos juveniles, campamentos, reuniones familiares e iglesias. 

El proyecto cuenta con un diseño de **estética televisiva premium**, efectos de focos de escenario, luces neón, animaciones de persianas 3D, confeti digital en tiempo real e integración de efectos de sonido inmersivos sintetizados con armónicos polifónicos de alta fidelidad.

---

## 🌟 Características Principales

*   **Pantalla Dual Sincronizada (Consola + Proyector):** Utiliza la API nativa de navegadores `BroadcastChannel` para comunicar la **Consola del Presentador** con el **Tablero del Proyector** en tiempo real, de manera 100% local, instantánea y sin requerir internet ni servidores externos.
*   **Audio Polifónico de Show de TV:** Cuenta con un motor de audio integrado (`Web Audio API` en `js/audio.js`) que genera tonos orquestales y efectos dinámicos: campana armónica con sobretonos brillantes, zumbador de strikes con distorsión dual de escenario, tictac de reloj con advertencia urgente, whoosh de persianas y fanfarrias triunfales.
*   **Animación Numérica Rodante (Score Rollup):** Los puntos de los equipos y del acumulado no cambian bruscamente; ruedan dinámicamente con efecto visual de show televisivo.
*   **Sistema de Confeti Digital Nativo:** Lluvia de confeti a 60 FPS en canvas ligero para celebrar victorias de rondas o alcanzar la meta de 200 puntos en Dinero Rápido.
*   **Atajos de Teclado para el Presentador (Live Hotkeys):**
    *   Teclas `1` a `8`: Revelar respuestas 1 a 8 en el proyector al instante.
    *   Tecla `X`: 1 Strike (zumbador + flash rojo en escenario).
    *   Tecla `Shift + X`: 2 Strikes.
    *   Tecla `Alt + X`: 3 Strikes.
    *   Tecla `A`: Activar turno del Grupo A.
    *   Tecla `B`: Activar turno del Grupo B.
    *   Tecla `Espacio`: Asignar puntos de la ronda al equipo en turno.
    *   Tecla `M`: Silenciar / Activar audio.
    *   Tecla `C`: Lanzar confeti manual.
*   **Buscador y Filtro por Categorías:** Permite filtrar entre las 40 preguntas del sistema por categoría o buscar por palabras clave en tiempo real, además de un botón de "Pregunta al Azar".
*   **Ronda Final de "Dinero Rápido" con Guion en Pantalla:** Panel de juego final equipado con cronómetro configurable (20s / 25s), barra de progreso hacia la meta de 200 puntos, botones de ceros rápidos y lector de preguntas en pantalla para que el host lea sin necesidad de papeles.
*   **Gestor de Preguntas Flexible (3 a 8 Respuestas) + Exportar / Importar:** Permite añadir preguntas con cantidades variables de respuestas, guardarlas localmente y respaldarlas exportando a archivos `.json` para compartir entre iglesias.
*   **Protección ante Recargas Accidentales:** Auto-guardado en `localStorage`; si se recarga la pestaña por error en pleno evento, se restaura el marcador y la ronda actual sin perder el progreso.
*   **100% Estático y Serverless:** Diseñado en HTML5, CSS3 y JavaScript puro. Corre sin conexión desde una memoria USB o publicado gratis en GitHub Pages.

---

## ⚡ ¿Se puede usar en GitHub Pages? (¡SÍ, TOTALMENTE!)

**¡Sí! De hecho, GitHub Pages es el lugar perfecto para hospedar este juego.** 

Al ser una aplicación web **100% estática** (sin bases de datos en servidor ni backend), funciona de manera impecable y gratuita en GitHub Pages:
1.  **Hospedaje gratuito y veloz:** GitHub se encarga de servir tus archivos en segundos.
2.  **Sincronización segura:** Al abrir la Consola del Host y el Proyector desde el mismo enlace web (`https://tu-usuario.github.io/tu-repositorio/`), ambos compartirán el mismo origen. Esto significa que **`BroadcastChannel` y `localStorage` se sincronizarán a la perfección en tiempo real** desde el mismo navegador de tu laptop (abriendo dos pestañas o ventanas distintas).

---

## 🚀 Cómo Publicar tu Juego en GitHub Pages (Paso a Paso)

Una vez que subas el código a tu repositorio de GitHub, sigue estos sencillos pasos:

1.  Entra a tu cuenta de **GitHub** y ve al repositorio de este proyecto.
2.  Haz clic en la pestaña **Settings** (Configuración) en el menú superior del repositorio.
3.  En la barra lateral izquierda, busca la sección **Code and automation** y haz clic en **Pages**.
4.  Bajo la opción **Build and deployment**:
    *   En **Source**, selecciona **Deploy from a branch**.
    *   En **Branch**, selecciona la rama principal (`main` o `master`) y la carpeta `/ (root)`.
    *   Haz clic en **Save** (Guardar).
5.  ¡Listo! Espera aproximadamente 1 a 2 minutos. GitHub generará un enlace como:  
    `https://tu-usuario.github.io/nombre-del-repositorio/`
6.  Abre ese enlace en tu laptop el día del evento, ¡y a jugar!

---

## 🎮 Guía Rápida para Jugar (Instrucciones)

1.  **Pantalla del Público (Proyector):** Abre el juego en el enlace publicado (o archivo local) y haz clic en **"Proyectar"**. Arrastra esa pestaña a la televisión o proyector de tu iglesia y presiona el botón **⛶** (o **F11**) para ponerla en Pantalla Completa.
2.  **Consola del Presentador:** En la pantalla de tu laptop o tablet, abre la **"Consola Host"**. Verás el indicador verde de **"Proyector Conectado"**.
3.  **🔊 Desbloqueo del Sonido:** Haz un clic en cualquier parte de la pantalla del Proyector y de la Consola Host al abrirlas para activar el motor de audio.
4.  **Cargar y Jugar:** Selecciona la pregunta en la consola del presentador (o presiona "Azar"), presiona **"Cargar"**, y usa los atajos o botones para controlar el show.

---

## 📁 Estructura del Proyecto

*   `index.html` - Portal de bienvenida, selector de modo y guía rápida de 3 pasos.
*   `host.html` - Consola de control de estudio de televisión para el presentador.
*   `board.html` - Tablero gigante de alta definición para el público con persianas 3D y confeti.
*   `css/` - Hojas de estilo modularizadas con paletas de iluminación escénica (`variables.css`, `main.css`, `host.css`, `board.css`).
*   `js/` - Motor de audio, base de datos y sincronización (`audio.js`, `database.js`, `host.js`, `board.js`).

---
Diseñado con ❤️ para la edificación y diversión de las familias de la iglesia. ¡Que sea de gran bendición para tu congregación! 🎙️⛪✨

