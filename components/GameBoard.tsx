
import React from 'react';
import type { Tile } from '../types';
import DominoTile from './DominoTile';

interface GameBoardProps {
  layout: Tile[];
}

const GameBoard: React.FC<GameBoardProps> = ({ layout }) => {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="flex flex-wrap items-center justify-center gap-1">
        {layout.map((tile) => (
          <DominoTile key={tile.id} a={tile.a} b={tile.b} small />
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
