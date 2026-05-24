# 🏆 Guía de Uso Oficial — Simulador & Porra Mundial 2026

¡Te damos la bienvenida al **Simulador y Porra del Mundial 2026**! Esta aplicación web de alto rendimiento te permite pronosticar los resultados de todo el torneo, competir con tus amigos en tiempo real y ver quién se corona como el rey de las predicciones.

Esta guía rápida explica detalladamente en qué consiste la aplicación, el sistema de puntuación y el rol del administrador.

---

## ⚽ ¿En qué consiste la Porra?

La dinámica del juego es muy sencilla pero altamente competitiva. Consta de **tres fases principales**:

1. **Registro y Pronósticos (Usuario):** Cada jugador se registra en la plataforma y completa sus predicciones para todos los partidos de la Fase de Grupos, las fases eliminatorias (desde Dieciseisavos de final hasta la Gran Final), y los galardones especiales (Goleadores, MVP y Zamora).
2. **Actualización de Resultados (Administrador):** Una vez que comienza el Mundial, el administrador **bloquea** los pronósticos de los usuarios. A medida que se juegan los partidos oficiales, el administrador introduce los marcadores reales y los premios oficiales.
3. **Puntuaciones en Tiempo Real:** El sistema calcula de forma automática y precisa la puntuación de cada usuario y actualiza la tabla de posiciones general (**Scoreboard**) para mostrar quién va a la cabeza.

---

## 🎮 Flujo de Trabajo para el Usuario (Jugador)

### 1️⃣ Registro e Inicio de Sesión
* **Crear Cuenta:** Accede a la pantalla de ingreso e introduce tu **correo electrónico**, una **contraseña** y un **Nick (Nombre de usuario)** que te identificará públicamente en la tabla de clasificaciones.
* **Menú Lateral:** Una vez dentro, tendrás acceso a tu panel personal de navegación mediante el menú lateral izquierdo.

### 2️⃣ Sección "Mis Pronósticos" (Fase de Grupos)
* Ingresa en **Mis Pronósticos > Fase de grupos** para pronosticar los partidos de los 12 grupos (**A al L**).
* **Cálculo Automático de Tablas:** A medida que introduces los marcadores en cada grupo, la tabla de posiciones interna se recalcula inmediatamente aplicando los criterios oficiales de la FIFA (Puntos, Diferencia de Goles y Goles a Favor).
* **Avance en el Bracket:** Al rellenar los partidos del grupo completo, las dos mejores selecciones avanzarán automáticamente al cuadro interactivo de eliminatorias de la parte inferior de la pantalla. ¡Tus predicciones dan vida al torneo!

### 3️⃣ Sección "Mis Pronósticos" (Eliminatorias)
* Completa tus pronósticos ronda por ronda en las pestañas correspondientes: **16avos**, **8avos**, **4tos**, **Semifinales** y **Final**.
* **⚠️ Regla de Oro en Eliminatorias:** En la fase eliminatoria no puede haber empates definitivos. Si pronosticas un empate, la aplicación te solicitará obligatoriamente que **selecciones al equipo ganador** que avanzará a la siguiente ronda (por tanda de penaltis o prórroga).
* Los ganadores que selecciones se propagarán automáticamente a las rondas posteriores.

### 4️⃣ Premios y Galardones Especiales
Para ganar puntos adicionales y marcar la diferencia, no olvides rellenar tus pronósticos especiales en:
* **Goleadores:** Elige a tus 3 candidatos para llevarse la Bota de Oro (seleccionando su selección y el nombre del jugador desde una base de datos real del torneo).
* **MVP:** Predice el jugador más valioso del torneo (Most Valuable Player).
* **Zamora:** Predice el mejor portero del campeonato (Guante de Oro).

*💡 Asegúrate de pulsar el botón **Guardar** en cada una de estas tres pantallas de galardones especiales antes de que comience el torneo.*

---

## 📈 Sistema de Puntuaciones (¿Cómo ganar?)

El éxito en la porra depende de la precisión de tus predicciones en los partidos. Los puntos se calculan únicamente sobre los partidos que ya cuentan con un **resultado real verificado** ingresado por el administrador.

El sistema premia el conocimiento futbolístico de la siguiente manera:

| Acierto | Descripción | Puntos |
| :--- | :--- | :---: |
| 🎯 **Marcador Exacto** | Acertaste la cantidad exacta de goles de ambos equipos (ej. Pronóstico: `2 - 1` \| Real: `2 - 1`). | **+4 pts** |
| 🔮 **Tendencia / Ganador** | Acertaste el ganador o el empate, pero no el resultado exacto (ej. Pronóstico: `3 - 1` \| Real: `1 - 0`; o Pronóstico: `1 - 1` \| Real: `2 - 2`). | **+1 pt** |
| ❌ **Sin Acierto** | Fallaste el resultado general (ej. Pronóstico: `1 - 0` \| Real: `0 - 2`). | **0 pts** |

### Criterios de Desempate en el Scoreboard
Si dos o más usuarios empatan en puntuación total en la pestaña **Puntuaciones**, la aplicación desempatará automáticamente siguiendo este orden jerárquico estricto:
1. **Puntos Totales:** Mayor cantidad de puntos acumulados.
2. **Aciertos Exactos:** Mayor cantidad de partidos acertados con marcador exacto (hits de 4 puntos).
3. **Orden Alfabético:** Alfabéticamente por correo electrónico del usuario.

---

## 🛠️ Panel del Administrador (Gestión del Torneo)

El Administrador tiene el control absoluto para garantizar la transparencia y el correcto funcionamiento de la porra. Sus responsabilidades son:

### 1️⃣ Gestión de Usuarios y Pagos (`/admin-users`)
* **Control de Inscripciones:** En la tabla de usuarios, el administrador puede visualizar quién se ha registrado y marcarlo como **"Paid" (Pagado)**. Esto es perfecto para gestionar los cobros de la porra de manera visual.
* **Mantenimiento:** Permite eliminar usuarios duplicados o reiniciar la porra borrando a todos los usuarios no administradores de una sola vez.

### 2️⃣ Cierre de Predicciones y Cierre de Resultados (`/admin-users`)
* **Cierre de Pronósticos:** Cuando se dé el pitido inicial del primer partido del torneo, el admin activará el **Bloqueo de Pronósticos**. A partir de ese momento, los usuarios no podrán modificar ninguna de sus predicciones (partidos o galardones).
* **Bloqueo de Resultados:** Una vez finalizado el torneo o cargados todos los resultados, el admin puede bloquear el ingreso de resultados reales para evitar modificaciones accidentales.

### 3️⃣ Cargar Resultados Reales (`Resultados`)
* El admin ingresa los marcadores reales de cada uno de los partidos a medida que transcurre el Mundial en la sección **Resultados > Fase de grupos** (y fases eliminatorias).
* De la misma manera, en **Resultados > Goleadores, MVP y Zamora**, definirá los ganadores reales del torneo.

### 4️⃣ Copias de Seguridad (Backup)
* Desde la cabecera superior, el administrador puede hacer clic en **Reset** para reiniciar el torneo, o exportar un archivo `.json` de respaldo (**Save Backup**) para resguardar todos los datos en caso de actualizaciones del servidor.

---

## 🚀 ¡Que comience el juego!
Regístrate, ingresa tus resultados con confianza, analiza el bracket dinámico y mantente atento a la pestaña **Puntuaciones** a lo largo del Mundial de 2026. ¡Buena suerte a todos los participantes!
