
import React from 'react';
import type { RoundResult } from '../types';

interface EndGameModalProps {
  result: RoundResult | { winningTeam: 'A' | 'B' };
  isGameOver: boolean;
  onNextRound: () => void;
  onNewGame: () => void;
}

const EndGameModal: React.FC<EndGameModalProps> = ({ result, isGameOver, onNextRound, onNewGame }) => {
  if (!result) return null;

  const { winningTeam } = result;
  const roundResult = result as RoundResult;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 text-center max-w-md w-full border-4 border-yellow-400">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">
          {isGameOver ? '¡Juego Terminado!' : '¡Ronda Terminada!'}
        </h2>
        
        <div className="text-xl mb-6 text-gray-700">
          {isGameOver ? (
            <p>El equipo <span className={`font-bold ${winningTeam === 'A' ? 'text-blue-600' : 'text-red-600'}`}>{winningTeam}</span> ha ganado la partida!</p>
          ) : (
            <>
                <p>
                    El equipo <span className={`font-bold ${winningTeam === 'A' ? 'text-blue-600' : 'text-red-600'}`}>{winningTeam}</span> gana la ronda por <span className="font-bold">{roundResult.reason}</span>.
                </p>
                <p className="text-2xl font-bold mt-2 text-green-700">+{roundResult.points} puntos</p>
                {roundResult.capicua && <p className="text-2xl font-bold mt-2 text-purple-600 animate-pulse">¡Capicúa! +25 puntos extra</p>}
                <p className="text-sm mt-2 text-gray-500">Ganó: {roundResult.winnerName}</p>
            </>
          )}
        </div>

        <button 
          onClick={isGameOver ? onNewGame : onNextRound}
          className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors duration-300 text-lg shadow-lg"
        >
          {isGameOver ? 'Jugar de Nuevo' : 'Siguiente Ronda'}
        </button>
      </div>
    </div>
  );
};

export default EndGameModal;
