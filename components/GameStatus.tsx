
import React from 'react';

interface GameStatusProps {
  message: string;
}

const GameStatus: React.FC<GameStatusProps> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-70 text-white p-4 rounded-lg shadow-xl border border-gray-500 max-w-sm">
        <p className="text-center font-medium">{message}</p>
    </div>
  );
};

export default GameStatus;
