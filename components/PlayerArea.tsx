import React from 'react';
import type { Player, Tile } from '../types';
import DominoTile from './DominoTile';

interface PlayerAreaProps {
  player: Player;
  isCurrent: boolean;
  isSelf: boolean;
  position: 'bottom' | 'left' | 'top' | 'right';
  onTileClick: (tile: Tile) => void;
  isValidMove: (tile: Tile) => boolean;
}

const PlayerArea: React.FC<PlayerAreaProps> = ({ player, isCurrent, isSelf, position, onTileClick, isValidMove }) => {

  const containerClasses = {
    bottom: 'flex-col items-center justify-end',
    top: 'flex-col-reverse items-center justify-start',
    left: 'flex-row-reverse items-center justify-start',
    right: 'flex-row items-center justify-end'
  };

  const handClasses = {
    bottom: 'flex-row space-x-1',
    top: 'flex-row space-x-1',
    left: 'flex-col space-y-1',
    right: 'flex-col space-y-1'
  };

  return (
    <div className={`flex p-2 ${containerClasses[position]}`}>
      <div className={`p-2 rounded-lg ${isCurrent ? 'bg-yellow-300 shadow-lg' : 'bg-green-600'}`}>
        <h3 className={`font-bold text-center ${isCurrent ? 'text-gray-900' : 'text-white'}`}>{player.name}{isSelf && ' (Tú)'}</h3>
        <p className={`text-sm text-center ${isCurrent ? 'text-gray-700' : 'text-gray-200'}`}>Equipo {player.team} | {player.hand.length} fichas</p>
      </div>
      <div className={`mt-2 mb-2 ml-2 mr-2 p-1 rounded min-h-[80px] min-w-[80px] flex ${handClasses[position]}`}>
        {player.hand.map((tile) => (
          <DominoTile
            key={tile.id}
            a={tile.a}
            b={tile.b}
            isVertical={position === 'left' || position === 'right'}
            isFaceDown={!isSelf}
            isClickable={isSelf && isCurrent && isValidMove(tile)}
            onClick={() => isSelf && isCurrent && isValidMove(tile) && onTileClick(tile)}
          />
        ))}
      </div>
    </div>
  );
};

export default PlayerArea;