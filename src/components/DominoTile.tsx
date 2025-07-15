
import React from 'react';

interface DominoTileProps {
  a: number;
  b: number;
  isVertical?: boolean;
  isClickable?: boolean;
  isFaceDown?: boolean;
  onClick?: () => void;
  small?: boolean;
}

const Dot: React.FC<{ count: number }> = ({ count }) => {
  const positions: { [key: number]: string[] } = {
    1: ['justify-center items-center'],
    2: ['justify-between items-start', 'justify-between items-end rotate-180'],
    3: ['justify-start items-start', 'justify-center items-center', 'justify-end items-end'],
    4: ['justify-between items-start', 'justify-between items-end', 'justify-between items-start rotate-180', 'justify-between items-end rotate-180'],
    5: ['justify-between items-start', 'justify-between items-end', 'justify-center items-center', 'justify-between items-start rotate-180', 'justify-between items-end rotate-180'],
    6: ['justify-between items-start', 'justify-between items-center', 'justify-between items-end', 'justify-between items-start rotate-180', 'justify-between items-center rotate-180', 'justify-between items-end rotate-180'],
  };

  if (count < 1 || count > 6) return null;

  return (
    <div className="w-full h-full relative p-1">
      {positions[count].map((pos, i) => (
        <div key={i} className={`absolute inset-0 flex ${pos}`}>
          <div className="w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
        </div>
      ))}
    </div>
  );
};


const DominoTile: React.FC<DominoTileProps> = ({ a, b, isVertical = false, isClickable = false, isFaceDown = false, onClick, small = false }) => {
  const baseClasses = 'bg-white border-2 border-gray-300 rounded-md shadow-md flex transition-all duration-200';
  const sizeClasses = small 
    ? (isVertical ? 'w-8 h-16 flex-col' : 'w-16 h-8')
    : (isVertical ? 'w-12 h-24 flex-col' : 'w-24 h-12');
  const clickableClasses = isClickable ? 'cursor-pointer hover:bg-yellow-100 hover:border-yellow-400 transform hover:-translate-y-1' : '';
  
  const doubleClass = a === b && !isVertical ? (small ? 'h-16 w-8 flex-col' : 'h-24 w-12 flex-col') : '';
  const finalSize = doubleClass || sizeClasses;

  if (isFaceDown) {
    return (
      <div className={`${baseClasses} ${finalSize} bg-gray-800 border-gray-600`}>
        <div className="w-full h-full flex items-center justify-center">
            <div className="w-4 h-4 bg-red-600 rounded-full"></div>
        </div>
      </div>
    );
  }

  const pips = [a, b];

  return (
    <div className={`${baseClasses} ${finalSize} ${clickableClasses} ${doubleClass ? 'flex-col' : (isVertical ? 'flex-col' : 'flex-row')}`} onClick={onClick}>
      <div className={`w-full h-1/2 flex items-center justify-center relative ${doubleClass ? '' : (isVertical ? '' : 'h-full w-1/2')}`}>
        <Dot count={pips[0]} />
      </div>
      <div className={`bg-gray-400 ${doubleClass || isVertical ? 'h-px w-full' : 'w-px h-full'}`}></div>
      <div className={`w-full h-1/2 flex items-center justify-center relative ${doubleClass ? '' : (isVertical ? '' : 'h-full w-1/2')}`}>
        <Dot count={pips[1]} />
      </div>
    </div>
  );
};

export default React.memo(DominoTile);
