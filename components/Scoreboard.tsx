
import React from 'react';

interface ScoreboardProps {
  scores: { A: number; B: number };
}

const Scoreboard: React.FC<ScoreboardProps> = ({ scores }) => {
  return (
    <div className="absolute top-4 left-4 bg-gray-900 bg-opacity-70 text-white p-4 rounded-lg shadow-xl border border-gray-500">
      <h2 className="text-xl font-bold mb-2 text-center border-b border-gray-400 pb-1">Puntuación</h2>
      <div className="flex justify-between space-x-8 text-lg">
        <div>
          <span className="font-semibold text-blue-300">Nosotros (A): </span>
          <span className="font-bold">{scores.A}</span>
        </div>
        <div>
          <span className="font-semibold text-red-300">Ellos (B): </span>
          <span className="font-bold">{scores.B}</span>
        </div>
      </div>
      <div className="text-xs text-center mt-2 text-gray-300">Primera pareja a 200 puntos gana.</div>
    </div>
  );
};

export default Scoreboard;
