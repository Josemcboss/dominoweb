
import React, { useState } from 'react';

interface LobbyProps {
  onCreateGame: (playerName: string) => void;
  onJoinGame: (gameId: string, playerName:string) => void;
}

const Lobby: React.FC<LobbyProps> = ({ onCreateGame, onJoinGame }) => {
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [showJoin, setShowJoin] = useState(false);

  const handleCreate = () => {
    if (playerName.trim()) {
      onCreateGame(playerName.trim());
    } else {
      alert('Por favor, introduce tu nombre.');
    }
  };

  const handleJoin = () => {
    if (playerName.trim() && gameId.trim()) {
      onJoinGame(gameId.trim(), playerName.trim());
    } else {
      alert('Por favor, introduce tu nombre y el ID de la partida.');
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-green-800">
        <div className="bg-gray-100 p-8 rounded-lg shadow-2xl text-center max-w-md w-full">
            <h1 className="text-4xl font-bold mb-4 text-gray-800">Dominó Dominicano</h1>
            <p className="text-gray-600 mb-8">¡Juega con tus amigos en línea!</p>

            <div className="mb-4">
                <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Introduce tu nombre"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
            </div>
            
            {showJoin ? (
                 <div className="space-y-4">
                    <input
                        type="text"
                        value={gameId}
                        onChange={(e) => setGameId(e.target.value)}
                        placeholder="Introduce el ID de la partida"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                     <button onClick={handleJoin} className="w-full bg-yellow-500 text-gray-900 font-bold py-3 rounded-lg hover:bg-yellow-600 transition-colors text-xl">
                        Unirse a Partida
                    </button>
                    <button onClick={() => setShowJoin(false)} className="text-gray-500 hover:text-gray-700">
                        Volver
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <button onClick={handleCreate} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors text-xl">
                        Crear Nueva Partida
                    </button>
                    <button onClick={() => setShowJoin(true)} className="w-full bg-gray-200 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-300 transition-colors text-xl">
                        Unirse a una Partida
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export default Lobby;
