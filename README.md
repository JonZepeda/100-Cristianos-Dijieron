# 🎙️ 100 Cristianos Dijeron - Juego Familiar para Iglesias

¡Bienvenido a **100 Cristianos Dijeron**! Este es un juego interactivo de estilo *Family Feud* adaptado con temáticas y preguntas cristianas, diseñado especialmente para dinámicas de grupos juveniles, campamentos, reuniones familiares e iglesias. 

El proyecto cuenta con un diseño de **estética televisiva premium**, efectos de luz neón, animaciones 3D e integración de efectos de sonido inmersivos sintetizados digitalmente.

---

## 🌟 Características Principales

*   **Pantalla Dual Sincronizada (Consola + Proyector):** Utiliza la API nativa de navegadores `BroadcastChannel` para comunicar la **Consola de Control del Presentador** con la **Pantalla del Público (Proyector)** en tiempo real, de manera 100% local, instantánea y sin requerir internet ni servidores externos.
*   **Audio Sintetizado Digitalmente:** Cuenta con un motor de audio integrado (`Web Audio API` en `js/audio.js`) que genera tonos y efectos de sonido dinámicos (campanas correctas, zumbadores de strikes, tictac del reloj y fanfarrias) directo en el navegador con 0% de latencia y sin depender de descargas de archivos `.mp3` pesados.
*   **Gestor de Preguntas Integrado (Editor CRUD):** Permite añadir, listar o eliminar preguntas desde la propia consola de forma interactiva. Los cambios se guardan permanentemente en el navegador mediante `localStorage`.
*   **Ronda Final de "Dinero Rápido":** Panel de juego final completamente equipado con cronómetro configurable, totalizador automático y controles independientes de revelación de respuestas y puntajes para mantener el suspenso.
*   **100% Estático y Serverless:** Diseñado en HTML5, CSS3 clásico y Vanilla Javascript. Ideal para correr sin conexión desde una memoria USB o subirlo a la nube gratis.

---

## ⚡ ¿Se puede usar en GitHub Pages? (¡SÍ, TOTALMENTE!)

**¡Sí! De hecho, GitHub Pages es el lugar perfecto para hospedar este juego.** 

Al ser una aplicación web **100% estática** (sin bases de datos en servidor ni backend), funciona de manera impecable y gratuita en GitHub Pages:
1.  **Hospedaje gratuito y veloz:** GitHub se encarga de servir tus archivos en segundos.
2.  **Sincronización segura:** Al abrir la Consola del Host y el Proyector desde el mismo enlace web (`https://tu-usuario.github.io/tu-repositorio/`), ambos compartirán el mismo origen. Esto significa que **`BroadcastChannel` y `localStorage` se sincronizarán a la perfección en tiempo real** desde el mismo navegador de tu laptop (abriendo dos pestañas o ventanas distintas).

---

## 🚀 Cómo Publicar tu Juego en GitHub Pages (Paso a Paso)

Una vez que subamos el código a tu repositorio de GitHub, sigue estos sencillos pasos para ponerlo en línea:

1.  Entra a tu cuenta de **GitHub** y ve al repositorio de este proyecto.
2.  Haz clic en la pestaña **Settings** (Configuración) en el menú superior del repositorio.
3.  En la barra lateral izquierda, busca la sección **Code and automation** y haz clic en **Pages**.
4.  Bajo la opción **Build and deployment**:
    *   En **Source**, selecciona **Deploy from a branch**.
    *   En **Branch**, selecciona la rama principal (usualmente `main` o `master`) y la carpeta `/ (root)`.
    *   Haz clic en **Save** (Guardar).
5.  ¡Listo! Espera aproximadamente 1 a 2 minutos. GitHub generará un enlace como:  
    `https://tu-usuario.github.io/nombre-del-repositorio/`
6.  Abre ese enlace en tu laptop el día del evento, ¡y a jugar!

---

## 🎮 Guía Rápida para Jugar (Instrucciones)

1.  **Pantalla del Público (Proyector):** Abre el juego en el enlace publicado (o archivo local) y haz clic en **"Proyectar"**. Arrastra esa pestaña a la televisión o proyector de tu iglesia y presiona **F11** en tu teclado para ponerla en Pantalla Completa.
2.  **Consola del Presentador:** En la pantalla de tu laptop o tablet, abre la **"Consola Host"**. Verás el indicador verde de **"Proyector Conectado"**.
3.  **🔊 ¡Importante para el Sonido!** Los navegadores modernos bloquean el sonido automático por seguridad. **Solo haz un clic en cualquier parte del Tablero del Proyector** y otro clic en la Consola del Host al abrir la pestaña. Esto desbloqueará el motor de audio.
4.  **Cargar y Jugar:** Selecciona la pregunta en la consola del presentador, presiona **"Cargar Pregunta"**, ¡y controla el show!

---

## 📁 Estructura del Proyecto

*   `index.html` - Pantalla de inicio y selector de rol.
*   `host.html` - Consola de control compacta para el presentador.
*   `board.html` - Tablero gigante de alta definición y visualización para el público.
*   `css/` - Hojas de estilo modularizadas con paletas LED Neón (`variables.css`, `main.css`, `host.css`, `board.css`).
*   `js/` - Lógica reactiva y base de datos (`audio.js`, `database.js`, `host.js`, `board.js`).

---
Diseñado con ❤️ para la edificación y diversión de las familias de la iglesia. ¡Que sea de gran bendición para tu grupo! 🎙️⛪✨
