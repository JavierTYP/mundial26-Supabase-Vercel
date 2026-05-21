# PROMPT: Simulador Interactivo del Mundial de Fútbol 2026

## OBJETIVO PRINCIPAL
Crear una aplicación web moderna, responsive e intuitiva para simular el torneo del Mundial de Fútbol 2026. El usuario puede predecir resultados de la fase de grupos, ver tablas de posiciones actualizadas automáticamente, y visualizar los cruces para octavos de final.

---

## ARQUITECTURA GENERAL

### Tech Stack
- **Frontend**: React 18+ con Next.js 14+ (o React puro con Vite)
- **Estilos**: Tailwind CSS + componentes de sombra/bordes modernos
- **Estado**: React Hooks (useState, useContext) o Zustand para estado global
- **Almacenamiento**: localStorage (persistencia local) + JSON para exportar
- **Responsivo**: Mobile-first, adaptado para desktop/tablet

### Estructura de Datos Principal
```json
{
  "grupos": {
    "A": {
      "equipos": [
        {"id": "uru", "nombre": "Uruguay", "pais": "🇺🇾"},
        {"id": "arg", "nombre": "Argentina", "pais": "🇦🇷"},
        ...
      ],
      "partidos": [
        {
          "id": "A1",
          "local": "uru",
          "visitante": "arg",
          "fecha": "2026-06-12",
          "resultado": {"local": null, "visitante": null},
          "confirmado": false
        }
      ]
    }
  },
  "clasificados": {},
  "octavos": []
}
```

---

## SECCIONES DE LA APP

### 1. HEADER GLOBAL
- Logo/Título "MUNDIAL 2026 - SIMULADOR"
- Contador: días/horas hasta el mundial
- Botón "Exportar Predicciones" (JSON/CSV)
- Botón "Reiniciar Simulación"

### 2. ÁREA DE GRUPOS (A - L)
**Diseño**: Tabs horizontales o acordeones por grupo

**Contenido por grupo:**
- **Tabla de Posiciones**
  - Columnas: Equipo | PJ | G | E | P | GF | GC | DG | Pts
  - Se actualiza automáticamente al ingresar resultados
  - Resaltar en verde primeros 2 equipos (clasificados a octavos)
  
- **Entrada de Resultados**
  - Tres matchdays separados (cada grupo juega 3 partidos)
  - Para cada partido:
    - Nombre equipo local (badge con bandera)
    - Input numérico (goles local)
    - "vs"
    - Input numérico (goles visitante)
    - Nombre equipo visitante (badge con bandera)
    - Botón "Actualizar"
  - Solo los primeros 2 clasificados se habilitan para octavos

### 3. ÁREA DE CLASIFICADOS
- Vista de 12 grupos en 2x6 grid
- Por cada grupo: Mostrar equipo 1° y 2° clasificado
- Card animada cuando ambos equipos se definen
- Preview de emparejamientos automáticos para octavos

### 4. ÁREA DE CRUCES (OCTAVOS A FINAL)
**Estructura visual: árbol de eliminatorias**

```
Octavos (16 equipos) → Cuartos (8) → Semis (4) → Final (2) → Campeón
```

- Inputs para resultados de octavos, cuartos, semis, final
- Avance automático de ganadores
- Visualización en árbol horizontal scrolleable
- Resaltar la ruta del equipo seleccionado (si quieres)

---

## DATOS DE GRUPOS 2026

**GRUPOS OFICIALES (12 GRUPOS):**

```
GRUPO A: Uruguay, Argentina, Marruecos, Panamá
GRUPO B: España, Alemania, Japón, Costa Rica
GRUPO C: Holanda, Senegal, Ecuador, Catar
GRUPO D: Francia, Dinamarca, Perú, Australia
GRUPO E: Brasil, Suiza, Camerún, Canadá
GRUPO F: México, Portugal, Polonia, Bélgica
GRUPO G: Argentina*, Colombia, Paraguay, Canadá*
GRUPO H: Irán, Turquía, Italia, Angola
GRUPO I: Uruguay*, Bolivia, Chile, Nigeria
GRUPO J: Gales, Japón*, Tailandia, Vietnam
GRUPO K: Francia*, Noruega, Serbia, Eslovaquia
GRUPO L: España*, Marruecos*, Irlanda, Sudáfrica
```

*NOTA: Los datos exactos pueden variar hasta el sorteo final. Usar plantilla genérica con 4 slots por grupo.*

---

## FUNCIONALIDADES CORE

### ✅ Fase de Grupos
1. **Input de Resultados**
   - Campos numéricos para goles (0-10 máximo)
   - Validación: no permitir resultados negativos
   - Feedback visual al actualizar (ej: flash verde)

2. **Cálculo Automático de Puntos**
   - Victoria: 3 pts
   - Empate: 1 pt
   - Derrota: 0 pts
   - Diferencia de goles como criterio de desempate
   - Goles a favor como segundo criterio

3. **Tabla de Posiciones**
   - Ordenada automáticamente por: Pts (desc) → DG (desc) → GF (desc)
   - Resaltar top 2 en verde claro

### ✅ Fase de Eliminatorias
1. **Cruzamiento Automático**
   - 1A vs 2B → 1B vs 2A (Octavos iniciales)
   - Mismo patrón para otros octavos (1C vs 2D, etc.)
   - Generar árbol dinámicamente

2. **Avance Automático**
   - Winner de octavos → Cuartos
   - Winner de cuartos → Semis
   - Winner de semis → Final
   - Desactivar inputs de rondas futuras hasta que se completen previas

### ✅ Persistencia
- Guardar estado en localStorage cada 5 segundos
- Mostrar último guardado: "Guardado hace X minutos"
- Botón "Restaurar desde backup"

### ✅ Exportación
- Botón "Descargar Predicciones" → JSON
- Botón "Exportar a Excel" (opcional, usar SheetJS si es necesario)

---

## DISEÑO UI/UX

### Paleta de Colores
- **Fondo**: Gradiente sutilmente oscuro (#0f172a a #1e293b)
- **Acentos**: Azul royal (#2563eb) y Verde éxito (#10b981)
- **Texto**: Blanco/gris claro para contraste
- **Errores**: Rojo suave (#ef4444)

### Componentes
- **Cards**: Bordes redondeados, sombra suave, hover effect
- **Inputs**: Bordes sutiles, focus ring azul, placeholder gris
- **Botones**: Redondeados, con transición suave, hover/active states
- **Badges**: Círculos pequeños con banderas emoji o código país (ISO)

### Responsive
- Mobile: Stack vertical, tabs para grupos
- Tablet: 2 columnas para grupos
- Desktop: 3 columnas o tabs con scroll horizontal

### Animaciones
- Fade-in suave al cargar datos
- Flash verde al actualizar resultado
- Slide-up para números que cambian
- Transition suave en cambios de tabla

---

## FLUJO DE USO

1. **Usuario abre la app** → Ve los 12 grupos con 4 equipos cada uno
2. **Selecciona un grupo** → Ve tabla de posiciones (todos 0 pts inicialmente) + 3 matchdays
3. **Ingresa resultados** → Matchday 1, actualiza un resultado
   - Tabla se actualiza automáticamente
   - Se calculan puntos y ordenamiento
4. **Completa todos los matchdays** → Los 2 primeros equipos se ponen en verde
5. **Hace scroll abajo** → Ve la zona de "Clasificados" con 12 grupos
6. **Hace scroll más abajo** → Ve el árbol de octavos/cuartos/semis/final
7. **Ingresa resultados en eliminatorias** → Avance automático y actualización de árbol
8. **Descarga predicciones** → JSON con toda la simulación

---

## ESPECIFICACIONES TÉCNICAS

### Componentes Recomendados
```
App.jsx (contenedor principal)
├── Header.jsx
├── GroupsSection.jsx
│   ├── GroupTabs.jsx
│   │   ├── GroupCard.jsx
│   │   │   ├── MatchdayTable.jsx
│   │   │   ├── MatchInput.jsx
│   │   │   └── StandingsTable.jsx
├── ClassifiedSection.jsx
│   └── ClassifiedGrid.jsx
├── KnockoutSection.jsx
│   └── KnockoutTree.jsx
└── Footer.jsx
```

### Hooks Personalizados (si aplica)
- `useGroups()` → gestionar estado de grupos
- `useKnockout()` → gestionar eliminatorias
- `useLocalStorage()` → persistencia
- `useCalculateStandings()` → calcular tablas dinámicamente

### Librerías Opcionales
- `zustand` o `jotai` para estado global (si es complejo)
- `date-fns` para manejo de fechas
- `papaparse` para export CSV
- `lucide-react` para iconos

---

## REQUISITOS NO FUNCIONALES

✅ **Performance**
- Carga < 2 segundos
- Actualización de tabla < 100ms
- Sin lag en inputs

✅ **Accesibilidad**
- Contraste WCAG AA
- Labels en inputs
- Navegación por teclado

✅ **SEO/PWA** (opcional pero nice-to-have)
- Meta tags relevantes
- Manifest.json para PWA
- Offline functionality (si localStorage es suficiente)

---

## DATOS DE EJEMPLO (para testing)

```javascript
// Grupo A - Ejemplo con resultados parciales
{
  "id": "A",
  "nombre": "Grupo A",
  "equipos": [
    { "id": "uru", "nombre": "Uruguay", "pais": "🇺🇾" },
    { "id": "arg", "nombre": "Argentina", "pais": "🇦🇷" },
    { "id": "mar", "nombre": "Marruecos", "pais": "🇲🇦" },
    { "id": "pan", "nombre": "Panamá", "pais": "🇵🇦" }
  ],
  "partidos": [
    {
      "id": "A1",
      "local": "uru",
      "visitante": "arg",
      "fecha": "2026-06-12",
      "resultado": { "local": 2, "visitante": 1 },
      "confirmado": true
    },
    // ... más partidos
  ]
}
```

---

## EXTRAS (NO OBLIGATORIO)

- 🎨 Dark/Light mode toggle
- 📊 Estadísticas: más goleadores, equipo defensivo, etc.
- 🏆 Historial de simulaciones guardadas
- 🤖 Predictor IA (basado en ranking FIFA actual)
- 📱 Share predicciones (QR/link)
- 🎬 Animación al final si tu equipo gana

---

## ENTREGA ESPERADA

Una carpeta con:
1. `index.html` / `App.jsx` (punto de entrada)
2. `components/` (componentes React)
3. `styles/` (Tailwind + CSS personalizado si aplica)
4. `utils/` (funciones de cálculo, localStorage, etc.)
5. `data/` (grupos, equipos, estructura inicial)
6. `README.md` con instrucciones de instalación y uso

**Debe ser funcional al 100% sin backend** → todo en el navegador.

---

## NOTAS FINALES

- Priorizar **usabilidad** sobre complejidad visual
- Hacer el input de resultados lo más rápido posible (tab entre campos)
- La tabla de posiciones es el corazón de la app → debe ser clara y actualizar en tiempo real
- Testear con datos del 2022 si tienes acceso (verificar cálculos)
- Pensar en casos edge: empates de puntos, descalificaciones (si aplica)

---

**¡Listo para codificar!** 🚀
