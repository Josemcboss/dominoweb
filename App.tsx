import React, { useState, useEffect, useCallback } from 'react';
import type { Tile, Game, Player } from './types';
import * as gameService from './src/services/gameService';
import PlayerArea from './components/PlayerArea';
import GameBoard from './components/GameBoard';
import Scoreboard from './components/Scoreboard';
import EndGameModal from './components/EndGameModal';
import GameStatus from './components/GameStatus';
import Lobby from './components/Lobby';

const App: React.FC = () => {
  const [game, setGame] = useState<Game | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    // Attempt to rejoin game on component mount
    const savedPlayerId = sessionStorage.getItem('dominoPlayerId');
    const savedGameId = sessionStorage.getItem('dominoGameId');
    if (savedPlayerId) {
      setPlayerId(savedPlayerId);
    }
    if (savedGameId) {
        const existingGame = gameService.getGame(savedGameId);
        if (existingGame) {
            setGame(existingGame);
        } else {
             // Game doesn't exist anymore, clear session
            sessionStorage.removeItem('dominoGameId');
            sessionStorage.removeItem('dominoPlayerId');
            setPlayerId(null);
        }
    }
  }, []);

  useEffect(() => {
    if (!game?.id) return;
    const unsubscribe = gameService.onGameStateUpdate(game.id, (updatedGame) => {
        if (updatedGame) {
             setGame(updatedGame);
        } else {
            // Game was deleted or not found, go back to lobby
            handleLeaveGame();
        }
    });
    return () => unsubscribe();
  }, [game?.id]);

  const handleCreateGame = (playerName: string) => {
    const { game: newGame, player } = gameService.createGame(playerName);
    sessionStorage.setItem('dominoGameId', newGame.id);
    sessionStorage.setItem('dominoPlayerId', player.id);
    setGame(newGame);
    setPlayerId(player.id);
  };

  const handleJoinGame = (gameId: string, playerName: string) => {
    try {
        const { game: updatedGame, player } = gameService.joinGame(gameId, playerName);
        sessionStorage.setItem('dominoGameId', updatedGame.id);
        sessionStorage.setItem('dominoPlayerId', player.id);
        setGame(updatedGame);
        setPlayerId(player.id);
    } catch(e) {
        alert((e as Error).message);
    }
  };

  const handleStartGame = () => {
      if (!game || !playerId) return;
      gameService.startGame(game.id, playerId);
  }

  const handleLeaveGame = () => {
    if (game && playerId) {
        gameService.leaveGame(game.id, playerId);
    }
    sessionStorage.removeItem('dominoGameId');
    sessionStorage.removeItem('dominoPlayerId');
    setGame(null);
    setPlayerId(null);
  }

  const isValidMove = useCallback((tile: Tile): boolean => {
    if (!game || game.layout.length === 0) return true;
    const [start, end] = game.layoutEnds;
    return tile.a === start || tile.a === end || tile.b === start || tile.b === end;
  }, [game]);

  const handlePlayerMove = (tile: Tile) => {
    if (!game || !playerId) return;
    gameService.makeMove(game.id, playerId, { action: 'play', tile });
  };
  
  const handlePlayerPass = () => {
    if (!game || !playerId) return;
    gameService.makeMove(game.id, playerId, { action: 'pass' });
  };
  
  const handleNextRound = () => {
    if (!game?.id || !playerId) return;
    gameService.startNewRound(game.id, playerId);
  };

  const handleNewGame = () => {
      if(!game?.id || !playerId) return;
      gameService.resetGame(game.id, playerId);
  }
  
  if (!game || !playerId) {
    return <Lobby onCreateGame={handleCreateGame} onJoinGame={handleJoinGame} />;
  }

  const self = game.players.find(p => p.id === playerId);
  const selfIndex = game.players.findIndex(p => p.id === playerId);

  if (!self) {
      // Player was removed from game
      handleLeaveGame();
      return <Lobby onCreateGame={handleCreateGame} onJoinGame={handleJoinGame} />;
  }
  
  const getPlayerByPosition = (pos: 'bottom' | 'top' | 'left' | 'right'): Player | undefined => {
      if (selfIndex === -1) return undefined;
      const posMap = {
          bottom: selfIndex,
          left: (selfIndex + 1) % 4,
          top: (selfIndex + 2) % 4,
          right: (selfIndex + 3) % 4,
      }
      return game.players[posMap[pos]];
  }

  const currentPlayer = game.players[game.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === playerId;
  const canPlayerPlay = self.hand.some(isValidMove);
  
  if (game.gameState === 'WAITING_FOR_PLAYERS') {
      return (
          <div className="w-screen h-screen flex flex-col items-center justify-center bg-green-800 text-white p-8">
              <h1 className="text-4xl font-bold mb-4">Sala de Espera</h1>
              <p className="text-lg mb-2">Comparte este ID para que otros se unan:</p>
              <div className="bg-white text-gray-800 font-mono text-2xl p-3 rounded-lg shadow-inner cursor-pointer" onClick={() => navigator.clipboard.writeText(game.id)}>
                  {game.id} <span className="text-sm">(haz clic para copiar)</span>
              </div>
              <div className="mt-8 w-full max-w-md">
                  <h2 className="text-2xl font-semibold mb-4">Jugadores Conectados ({game.players.length}/4):</h2>
                  <ul className="bg-green-700 p-4 rounded-lg space-y-2">
                      {game.players.map((p, i) => (
                          <li key={p.id} className="text-xl">
                              {i+1}. {p.name} {p.isHost && '(Anfitrión)'} {p.id === playerId && '(Tú)'} - Equipo {p.team}
                          </li>
                      ))}
                  </ul>
              </div>
              {self.isHost && game.players.length === 4 && (
                  <button onClick={handleStartGame} className="mt-8 px-8 py-4 bg-yellow-500 text-gray-900 font-bold rounded-lg shadow-lg hover:bg-yellow-600 transition text-xl animate-pulse">
                      ¡Empezar Juego!
                  </button>
              )}
               {self.isHost && game.players.length < 4 && (
                  <p className="mt-8 text-yellow-300">Esperando a que se unan {4 - game.players.length} jugador(es) más...</p>
              )}
              <button onClick={handleLeaveGame} className="absolute top-4 right-4 px-4 py-2 bg-red-600 text-white font-bold rounded-lg shadow-lg hover:bg-red-700 transition">
                  Salir
              </button>
          </div>
      )
  }

  const playerPositions: ('bottom' | 'top' | 'left' | 'right')[] = ['bottom', 'left', 'top', 'right'];

  return (
    <div className="w-screen h-screen bg-green-800 text-white overflow-hidden relative select-none">
      <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/wood-pattern.png')", opacity: 0.1}}></div>
      
      <Scoreboard scores={game.scores} />
      <GameStatus message={game.gameMessage} />
      {(game.gameState === 'ROUND_OVER' || game.gameState === 'GAME_OVER') && game.roundResult && (
        <EndGameModal 
            result={game.gameState === 'GAME_OVER' ? { winningTeam: game.roundResult.winningTeam } : game.roundResult}
            isGameOver={game.gameState === 'GAME_OVER'}
            onNewGame={handleNewGame}
            onNextRound={handleNextRound}
        />
      )}

      <div className="w-full h-full grid grid-cols-[200px_1fr_200px] grid-rows-[200px_1fr_200px]">
        {playerPositions.map(position => {
          const p = getPlayerByPosition(position);
          if (!p) return null;
          
          let gridClass = '';
          switch(position) {
              case 'top': gridClass = 'col-start-2 row-start-1 flex justify-center'; break;
              case 'left': gridClass = 'col-start-1 row-start-2 flex items-center'; break;
              case 'right': gridClass = 'col-start-3 row-start-2 flex items-center'; break;
              case 'bottom': gridClass = 'col-start-2 row-start-3 flex justify-center'; break;
          }

          return (
            <div key={p.id} className={gridClass}>
                <PlayerArea 
                    player={p} 
                    isCurrent={currentPlayer?.id === p.id} 
                    position={position} 
                    onTileClick={handlePlayerMove} 
                    isValidMove={isValidMove}
                    isSelf={p.id === playerId}
                />
            </div>
          )
        })}
        
        <div className="col-start-2 row-start-2 bg-green-700 bg-opacity-50 rounded-lg shadow-inner border-2 border-green-900">
          <GameBoard layout={game.layout} />
        </div>
        
      </div>

      {game.gameState === 'PLAYING' && isMyTurn && !canPlayerPlay && (
        <div className="absolute bottom-4 right-4">
          <button onClick={handlePlayerPass} className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow-lg hover:bg-red-700 transition animate-pulse">
            Pasar
          </button>
        </div>
      )}
      <button onClick={handleLeaveGame} className="absolute top-4 right-4 px-4 py-2 bg-red-600 text-white font-bold rounded-lg shadow-lg hover:bg-red-700 transition">
        Salir
      </button>
    </div>
  );
};

export default App;
