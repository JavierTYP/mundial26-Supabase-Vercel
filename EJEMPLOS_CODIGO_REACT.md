# Ejemplos de Código - Simulador Mundial 2026

## 1. Hook personalizado: `useCalculateStandings`

```javascript
// hooks/useCalculateStandings.js

export const useCalculateStandings = (grupo) => {
  const calcularPuntos = (resultado) => {
    if (resultado.local === null || resultado.visitante === null) return null;
    
    if (resultado.local > resultado.visitante) return { local: 3, visitante: 0 };
    if (resultado.local < resultado.visitante) return { local: 0, visitante: 3 };
    return { local: 1, visitante: 1 };
  };

  const standings = grupo.equipos.map(equipo => {
    const stats = {
      ...equipo,
      pj: 0,
      g: 0,
      e: 0,
      p: 0,
      gf: 0,
      gc: 0,
      pts: 0
    };

    grupo.partidos.forEach(partido => {
      if (!partido.jugado) return;

      const puntos = calcularPuntos(partido.resultado);
      if (!puntos) return;

      if (partido.idLocal === equipo.id) {
        stats.pj += 1;
        stats.gf += partido.resultado.local;
        stats.gc += partido.resultado.visitante;
        stats.pts += puntos.local;

        if (partido.resultado.local > partido.resultado.visitante) stats.g += 1;
        else if (partido.resultado.local < partido.resultado.visitante) stats.p += 1;
        else stats.e += 1;
      }

      if (partido.idVisitante === equipo.id) {
        stats.pj += 1;
        stats.gf += partido.resultado.visitante;
        stats.gc += partido.resultado.local;
        stats.pts += puntos.visitante;

        if (partido.resultado.visitante > partido.resultado.local) stats.g += 1;
        else if (partido.resultado.visitante < partido.resultado.local) stats.p += 1;
        else stats.e += 1;
      }
    });

    stats.dg = stats.gf - stats.gc;
    return stats;
  });

  // Ordenar por: Pts (desc) → DG (desc) → GF (desc)
  return standings.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dg !== a.dg) return b.dg - a.dg;
    return b.gf - a.gf;
  });
};
```

---

## 2. Componente: `StandingsTable`

```javascript
// components/StandingsTable.jsx

import React from 'react';
import { useCalculateStandings } from '../hooks/useCalculateStandings';

export const StandingsTable = ({ grupo }) => {
  const standings = useCalculateStandings(grupo);

  const isClassified = (index) => index < 2;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-800 border-b-2 border-blue-500">
            <th className="p-2 text-left text-white">Equipo</th>
            <th className="p-2 text-center text-white">PJ</th>
            <th className="p-2 text-center text-white">G</th>
            <th className="p-2 text-center text-white">E</th>
            <th className="p-2 text-center text-white">P</th>
            <th className="p-2 text-center text-white">GF</th>
            <th className="p-2 text-center text-white">GC</th>
            <th className="p-2 text-center text-white">DG</th>
            <th className="p-2 text-center text-white font-bold">PTS</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((equipo, idx) => (
            <tr
              key={equipo.id}
              className={`border-b transition-colors ${
                isClassified(idx)
                  ? 'bg-green-900 bg-opacity-30 hover:bg-green-800 hover:bg-opacity-40'
                  : 'hover:bg-gray-700'
              }`}
            >
              <td className="p-2 font-semibold text-white">
                <span className="mr-2">{equipo.bandera}</span>
                {equipo.nombre}
              </td>
              <td className="p-2 text-center text-gray-300">{equipo.pj}</td>
              <td className="p-2 text-center text-gray-300">{equipo.g}</td>
              <td className="p-2 text-center text-gray-300">{equipo.e}</td>
              <td className="p-2 text-center text-gray-300">{equipo.p}</td>
              <td className="p-2 text-center text-gray-300">{equipo.gf}</td>
              <td className="p-2 text-center text-gray-300">{equipo.gc}</td>
              <td className="p-2 text-center text-gray-300">{equipo.dg}</td>
              <td className="p-2 text-center font-bold text-white bg-blue-900 bg-opacity-50">
                {equipo.pts}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

## 3. Componente: `MatchInputRow`

```javascript
// components/MatchInputRow.jsx

import React, { useState } from 'react';

export const MatchInputRow = ({ 
  partido, 
  grupoId, 
  equipoLocal, 
  equipoVisitante,
  onUpdate 
}) => {
  const [goles, setGoles] = useState({
    local: partido.resultado.local ?? '',
    visitante: partido.resultado.visitante ?? ''
  });

  const [feedbackFlash, setFeedbackFlash] = useState(false);

  const handleChange = (tipo, valor) => {
    const num = valor === '' ? null : Math.max(0, Math.min(10, parseInt(valor) || 0));
    setGoles(prev => ({ ...prev, [tipo]: num }));
  };

  const handleSubmit = () => {
    if (goles.local === '' || goles.visitante === '') {
      alert('Por favor completa ambos marcadores');
      return;
    }

    onUpdate(grupoId, partido.id, goles.local, goles.visitante);
    
    // Flash de feedback
    setFeedbackFlash(true);
    setTimeout(() => setFeedbackFlash(false), 300);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className={`flex items-center justify-between gap-4 p-3 rounded-lg border transition-all ${
      feedbackFlash ? 'bg-green-500 bg-opacity-20 border-green-500' : 'border-gray-600'
    }`}>
      <div className="flex items-center gap-2 flex-1">
        <span className="text-sm font-semibold text-white">
          {equipoLocal.bandera} {equipoLocal.nombre}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="number"
          min="0"
          max="10"
          value={goles.local === '' ? '' : goles.local}
          onChange={(e) => handleChange('local', e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="-"
          className="w-12 p-2 text-center bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500"
        />
        <span className="text-gray-400">vs</span>
        <input
          type="number"
          min="0"
          max="10"
          value={goles.visitante === '' ? '' : goles.visitante}
          onChange={(e) => handleChange('visitante', e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="-"
          className="w-12 p-2 text-center bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex items-center gap-2 flex-1 justify-end">
        <span className="text-sm font-semibold text-white">
          {equipoVisitante.nombre} {equipoVisitante.bandera}
        </span>
      </div>

      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition-colors ml-4"
      >
        Actualizar
      </button>
    </div>
  );
};
```

---

## 4. Componente: `GroupCard`

```javascript
// components/GroupCard.jsx

import React, { useState } from 'react';
import { StandingsTable } from './StandingsTable';
import { MatchInputRow } from './MatchInputRow';

export const GroupCard = ({ grupo, onUpdateResult }) => {
  const [activeMatchday, setActiveMatchday] = useState(1);

  const getMatchdayPartidos = (matchday) => {
    return grupo.partidos.filter(p => p.matchday === matchday);
  };

  const matchdays = [1, 2, 3];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">
        {grupo.nombre}
      </h2>

      {/* Tabla de posiciones */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Posiciones</h3>
        <StandingsTable grupo={grupo} />
      </div>

      {/* Matchdays */}
      <div className="space-y-4">
        <div className="flex gap-2 border-b border-gray-700">
          {matchdays.map(md => (
            <button
              key={md}
              onClick={() => setActiveMatchday(md)}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeMatchday === md
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Fecha {md}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {getMatchdayPartidos(activeMatchday).map(partido => {
            const equipoLocal = grupo.equipos.find(e => e.id === partido.idLocal);
            const equipoVisitante = grupo.equipos.find(e => e.id === partido.idVisitante);

            return (
              <MatchInputRow
                key={partido.id}
                partido={partido}
                grupoId={grupo.id}
                equipoLocal={equipoLocal}
                equipoVisitante={equipoVisitante}
                onUpdate={onUpdateResult}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
```

---

## 5. Componente: `Header`

```javascript
// components/Header.jsx

import React, { useState, useEffect } from 'react';

export const Header = ({ onExport, onReset }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const mundial = new Date('2026-06-12').getTime();
      const ahora = new Date().getTime();
      const diferencia = mundial - ahora;

      if (diferencia > 0) {
        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferencia / (1000 * 60 * 60)) % 24);
        setTimeLeft(`${dias}d ${horas}h`);
      } else {
        setTimeLeft('¡El mundial ha comenzado!');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 3600000); // Actualizar cada hora

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-gradient-to-r from-blue-900 to-blue-800 border-b-2 border-blue-500 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">🏆 MUNDIAL 2026</h1>
          <p className="text-blue-200 text-sm">Simulador de Predicciones</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-blue-200 text-xs">Falta para el mundial:</p>
            <p className="text-white font-bold text-lg">{timeLeft}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onExport}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition-colors"
            >
              ⬇️ Exportar
            </button>
            <button
              onClick={onReset}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition-colors"
            >
              🔄 Reiniciar
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
```

---

## 6. Componente: `ClassifiedGrid`

```javascript
// components/ClassifiedGrid.jsx

import React from 'react';
import { useCalculateStandings } from '../hooks/useCalculateStandings';

export const ClassifiedGrid = ({ torneo }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(torneo.grupos).map(([grupoId, grupo]) => {
        const standings = useCalculateStandings(grupo);
        const primero = standings[0];
        const segundo = standings[1];

        const ambosDefinidos = primero && segundo;

        return (
          <div
            key={grupoId}
            className={`p-4 rounded-lg border-2 transition-all ${
              ambosDefinidos
                ? 'bg-green-900 bg-opacity-30 border-green-500 shadow-lg shadow-green-500/30'
                : 'bg-gray-800 border-gray-700'
            }`}
          >
            <h3 className="text-lg font-bold text-white mb-4">{grupo.nombre}</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-gray-900 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🥇</span>
                  <span className="font-semibold text-white">
                    {primero ? `${primero.bandera} ${primero.nombre}` : '-'}
                  </span>
                </div>
                {primero && (
                  <span className="font-bold text-blue-400">{primero.pts} pts</span>
                )}
              </div>

              <div className="flex items-center justify-between p-2 bg-gray-900 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🥈</span>
                  <span className="font-semibold text-white">
                    {segundo ? `${segundo.bandera} ${segundo.nombre}` : '-'}
                  </span>
                </div>
                {segundo && (
                  <span className="font-bold text-blue-400">{segundo.pts} pts</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
```

---

## 7. App.jsx Principal

```javascript
// App.jsx

import React, { useState, useEffect } from 'react';
import mundial2026 from './data/mundial2026.json';
import { Header } from './components/Header';
import { GroupCard } from './components/GroupCard';
import { ClassifiedGrid } from './components/ClassifiedGrid';

function App() {
  const [torneo, setTorneo] = useState(mundial2026);
  const [activeGroup, setActiveGroup] = useState('A');
  const [lastSaved, setLastSaved] = useState(null);

  // Auto-save cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem('mundial2026_data', JSON.stringify(torneo));
      setLastSaved(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [torneo]);

  // Cargar datos guardados al montar
  useEffect(() => {
    const saved = localStorage.getItem('mundial2026_data');
    if (saved) {
      setTorneo(JSON.parse(saved));
    }
  }, []);

  const handleUpdateResult = (grupoId, partidoId, local, visitante) => {
    setTorneo(prev => ({
      ...prev,
      grupos: {
        ...prev.grupos,
        [grupoId]: {
          ...prev.grupos[grupoId],
          partidos: prev.grupos[grupoId].partidos.map(p =>
            p.id === partidoId
              ? { 
                  ...p, 
                  resultado: { local, visitante },
                  jugado: true,
                  confirmado: true
                }
              : p
          )
        }
      }
    }));
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(torneo, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mundial2026_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleReset = () => {
    if (confirm('¿Estás seguro de que quieres reiniciar todo?')) {
      setTorneo(mundial2026);
      localStorage.removeItem('mundial2026_data');
    }
  };

  const grupos = Object.keys(torneo.grupos);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Header onExport={handleExport} onReset={handleReset} />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* SECCIÓN DE GRUPOS */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">📊 Fase de Grupos</h2>

          {/* Tabs de grupos */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-gray-700">
            {grupos.map(grupoId => (
              <button
                key={grupoId}
                onClick={() => setActiveGroup(grupoId)}
                className={`px-4 py-2 font-bold rounded-t-lg transition-all whitespace-nowrap ${
                  activeGroup === grupoId
                    ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Grupo {grupoId}
              </button>
            ))}
          </div>

          {/* Contenido del grupo activo */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <GroupCard
              grupo={torneo.grupos[activeGroup]}
              onUpdateResult={handleUpdateResult}
            />
          </div>
        </section>

        {/* SECCIÓN DE CLASIFICADOS */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">🏅 Clasificados para Octavos</h2>
          <ClassifiedGrid torneo={torneo} />
        </section>

        {/* SECCIÓN DE ELIMINATORIAS (FUTURA) */}
        <section>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
            <h2 className="text-2xl font-bold text-gray-400 mb-4">🎯 Octavos y Eliminatorias</h2>
            <p className="text-gray-500">Próximamente - Se habilitará después de completar fase de grupos</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-gray-700">
          <p className="text-gray-500 text-sm">
            {lastSaved && `Último guardado: ${lastSaved.toLocaleTimeString()}`}
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
```

---

## 8. Setup inicial con Vite + React

```bash
# Crear proyecto
npm create vite@latest mundial2026 -- --template react
cd mundial2026

# Instalar dependencias
npm install
npm install -D tailwindcss postcss autoprefixer

# Configurar Tailwind
npx tailwindcss init -p

# Instalar Zustand (si quieres estado global)
npm install zustand
```

---

## Tailwind Config (tailwind.config.js)

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        }
      }
    },
  },
  plugins: [],
}
```

---

## CSS Global (index.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  scroll-behavior: smooth;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}
```

---

¡Ahora estás listo para codificar! 🚀
