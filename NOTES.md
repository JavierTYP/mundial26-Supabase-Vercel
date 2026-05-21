
# Mundial 2026
### Run app desarrollo
```bash
PS1> npm run dev:full
PS1> npm run dev
```

### Producción
```bash
npm run prod
```

  ➜  Admin:   http://localhost:5174/

  ➜  Local:   http://localhost:5173/

  ➜  Network: http://192.168.99.80:5173/

### URLs típicas:
Con npm run dev: http://192.168.1.140:5173/
Con npm run prod: http://192.168.1.140:5174/


### Admin
- Resumen
- Exportación masiva


Ver: https://www.infobae.com/mundial-2026/grupos/

### Mejoras
- Añadir Nick o nombre de team/player
- La tabla de posiciones se debería ir actualizando según se vayan añadiendo resultados ➜ Ok
- Los resultados introducidos por cada usuario se deberán guardar automáticamente. ➜ Ok
- En las fases eliminatorias si el resultado es de empate hay que seleccionar un ganador. ➜ Ok

### Mejoras a nivel admin
- En la tabla de usuarios se debería ver el Nick del usuario.
- Más información de los usuarios.
- App móvil. ➜ Ok
-


### Cómo levantar la app
Tienes 2 formas correctas de levantarla, según si quieres **modo desarrollo** o **modo “producción” local**.

**Opción A (recomendada): Desarrollo (2 terminales)**
1) Terminal 1 (backend API en `5174`):
- `npm run dev:full`

2) Terminal 2 (frontend Vite en `5173`, con proxy `/api` → `5174`):
- `npm run dev`

3) Abre en el navegador:
- `http://localhost:5173`


**Opción B: “Producción” local (1 terminal)**
1) Compila frontend + arranca backend (sirve `dist/` en `5174`):
- `npm run prod`

2) Abre en el navegador:
- `http://localhost:5174`

Notas:
- `npm run start` = solo backend (`5174`), **no** compila ni levanta el frontend por sí solo.
- Si usas la Opción A, la URL para “ver la app” es `5173`. Si usas la Opción B, es `5174`.