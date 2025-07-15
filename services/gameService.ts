import type { Game, Player, Tile, Move, RoundResult } from '../types';

const WINNING_SCORE = 200;
const GAMES_STORAGE_KEY = 'domino-games';

// --- Helper Functions ---
const getGames = (): Record<string, Game> => {
  try {
    const games = localStorage.getItem(GAMES_STORAGE_KEY);
    return games ? JSON.parse(games) : {};
  } catch (e) {
    return {};
  }
};

const saveGames = (games: Record<string, Game>) => {
  localStorage.setItem(GAMES_STORAGE_KEY, JSON.stringify(games));
};

const createDeck = (): Tile[] => {
  const tiles: Tile[] = [];
  for (let i = 0; i <= 6; i++) {
    for (let j = i; j <= 6; j++) {
      tiles.push({ a: i, b: j, id: `${i}-${j}` });
    }
  }
  return tiles;
};

// --- Game Logic Functions (moved from App.tsx) ---
const _startRoundLogic = (game: Game, starterIndex: number): Game => {
    const deck = createDeck();
    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    game.players.forEach(p => p.hand = []);

    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 4; j++) {
            const tile = deck.pop();
            if (tile) game.players[j].hand.push(tile);
        }
    }
    
    game.players.forEach(p => p.hand.sort((a, b) => (b.a + b.b) - (a.a + a.b) || b.a - a.a));
    
    let startingPlayerIndex = -1;
    // The first round starter is determined by the double six.
    // Subsequent rounds, the starter is passed to the right.
    if(game.scores.A === 0 && game.scores.B === 0) {
        startingPlayerIndex = game.players.findIndex(p => p.hand.some(t => t.a === 6 && t.b === 6));
        if (startingPlayerIndex === -1) { // if no one has 6-6, any player can start with any tile
             startingPlayerIndex = 0;
        }
    } else {
        startingPlayerIndex = starterIndex;
    }

    game.layout = [];
    game.layoutEnds = [null, null];
    game.currentPlayerIndex = startingPlayerIndex;
    game.roundStarterIndex = startingPlayerIndex;
    game.passes = 0;
    game.gameState = 'PLAYING';
    game.roundResult = null;
    game.gameMessage = `Inicia la ronda. Empieza ${game.players[startingPlayerIndex].name}.`;

    return game;
}

const _endRoundLogic = (game: Game, result: RoundResult): Game => {
    game.roundResult = result;
    const newScores = {...game.scores};
    newScores[result.winningTeam] += result.points;
    if (result.capicua) {
        newScores[result.winningTeam] += 25;
    }
    game.scores = newScores;

    if (newScores[result.winningTeam] >= WINNING_SCORE) {
        game.gameState = 'GAME_OVER';
        game.gameMessage = `¡Juego terminado! El equipo ${result.winningTeam} gana.`;
    } else {
        game.gameState = 'ROUND_OVER';
        game.gameMessage = `Ronda terminada. El equipo ${result.winningTeam} gana ${result.points} puntos.`;
    }
    return game;
}

const _applyMove = (game: Game, playerIndex: number, move: Move): Game => {
    const player = game.players[playerIndex];
    
    // Pass turn
    if (move.action === 'pass') {
        game.gameMessage = `${player.name} pasó.`;
        game.passes += 1;

        if (game.passes >= 4) { // Trancado!
            let pipCounts = game.players.map(p => ({
                player: p,
                pips: p.hand.reduce((sum, t) => sum + t.a + t.b, 0)
            }));
            
            // In a tie, the starting player of the round wins.
            const winnerData = pipCounts.reduce((winner, current) => {
                if (current.pips < winner.pips) return current;
                if (current.pips === winner.pips) {
                    return game.players[game.roundStarterIndex].team === current.player.team ? current : winner;
                }
                return winner;
            });

            const winner = winnerData.player;
            const totalPips = game.players.reduce((sum, p) => p === winner ? sum : sum + p.hand.reduce((s, t) => s + t.a + t.b, 0), 0);

            return _endRoundLogic(game, {
                winningTeam: winner.team,
                points: totalPips,
                reason: 'Trancado',
                capicua: false,
                winnerName: winner.name,
            });
        }
        game.currentPlayerIndex = (game.currentPlayerIndex + 1) % 4;
        return game;
    }

    // Play tile
    if (move.action === 'play' && move.tile) {
        const tile = move.tile;
        player.hand = player.hand.filter(t => t.id !== tile.id);

        if (game.layout.length === 0) {
            game.layout = [tile];
            game.layoutEnds = tile.a === tile.b ? [tile.a, tile.b] : [tile.a, tile.b];
        } else {
            const [start, end] = game.layoutEnds;
            if (tile.a === start || tile.b === start) {
                const tileToPlace = tile.b === start ? tile : { ...tile, a: tile.b, b: tile.a };
                game.layout.unshift(tileToPlace);
                game.layoutEnds[0] = tileToPlace.a;
            } else if (tile.a === end || tile.b === end) {
                const tileToPlace = tile.a === end ? tile : { ...tile, a: tile.b, b: tile.a };
                game.layout.push(tileToPlace);
                game.layoutEnds[1] = tileToPlace.b;
            }
        }
        
        game.passes = 0;
        game.gameMessage = `${player.name} jugó ${tile.a}|${tile.b}.`;

        if (player.hand.length === 0) { // Domino!
            let points = 0;
            game.players.forEach(p => {
                if (p.team !== player.team) {
                    points += p.hand.reduce((sum, t) => sum + t.a + t.b, 0);
                }
            });

            // Capicúa check
            let capicua = false;
            const playedValue = game.layoutEnds.includes(tile.a) ? tile.a : tile.b;
            const otherEnd = game.layoutEnds[0] === playedValue ? game.layoutEnds[1] : game.layoutEnds[0];
            const freeEndValue = game.layout.length === 1 ? playedValue : otherEnd;
            const winningTileValues = [tile.a, tile.b];
            
            if (winningTileValues.includes(freeEndValue!)) {
                capicua = true;
            }

            return _endRoundLogic(game, {
                winningTeam: player.team,
                points: points,
                reason: 'Dominó',
                capicua: capicua,
                winnerName: player.name
            });
        }

        game.currentPlayerIndex = (game.currentPlayerIndex + 1) % 4;
    }

    return game;
}

// --- Public API ---
export const getGame = (gameId: string): Game | null => {
    const games = getGames();
    return games[gameId] || null;
}

export const createGame = (playerName: string): { game: Game, player: Player } => {
  const games = getGames();
  const gameId = Math.random().toString(36).substring(2, 7);
  const playerId = Math.random().toString(36).substring(2, 10);
  
  const hostPlayer: Player = { id: playerId, name: playerName, hand: [], team: 'A', isHost: true };

  const newGame: Game = {
    id: gameId,
    players: [hostPlayer],
    gameState: 'WAITING_FOR_PLAYERS',
    layout: [],
    layoutEnds: [null, null],
    currentPlayerIndex: 0,
    scores: { A: 0, B: 0 },
    roundStarterIndex: 0,
    passes: 0,
    roundResult: null,
    gameMessage: 'Esperando a que se unan los jugadores...',
    hostId: playerId,
  };

  games[gameId] = newGame;
  saveGames(games);
  return { game: newGame, player: hostPlayer };
};

export const joinGame = (gameId: string, playerName: string): { game: Game, player: Player } => {
    const games = getGames();
    const game = games[gameId];

    if (!game) throw new Error("Partida no encontrada.");
    if (game.players.length >= 4) throw new Error("La partida ya está llena.");
    
    const playerId = Math.random().toString(36).substring(2, 10);
    const playerTeam = game.players.length % 2 === 0 ? 'A' : 'B';
    const newPlayer: Player = { id: playerId, name: playerName, hand: [], team: playerTeam, isHost: false };
    
    game.players.push(newPlayer);
    game.gameMessage = `${playerName} se ha unido a la partida.`;
    
    saveGames(games);
    return { game, player: newPlayer };
}

export const leaveGame = (gameId: string, playerId: string) => {
    const games = getGames();
    const game = games[gameId];
    if (!game) return;

    game.players = game.players.filter(p => p.id !== playerId);
    game.gameMessage = `Un jugador ha abandonado la partida.`;
    game.gameState = 'WAITING_FOR_PLAYERS'; // Reset to lobby if someone leaves

    if(game.players.length === 0) {
        delete games[gameId];
    } else {
        // if host leaves, assign a new host
        if(game.hostId === playerId) {
            game.players[0].isHost = true;
            game.hostId = game.players[0].id;
        }
    }
    
    saveGames(games);
}


export const startGame = (gameId: string, playerId: string) => {
    const games = getGames();
    const game = games[gameId];
    if (!game || game.hostId !== playerId || game.players.length !== 4) return;
    
    _startRoundLogic(game, 0);

    saveGames(games);
}

export const makeMove = (gameId: string, playerId: string, move: Move) => {
    const games = getGames();
    let game = games[gameId];
    if (!game || game.gameState !== 'PLAYING') return;

    const playerIndex = game.players.findIndex(p => p.id === playerId);
    if (playerIndex !== game.currentPlayerIndex) return; // Not your turn

    game = _applyMove(game, playerIndex, move);
    
    saveGames(games);
}

export const startNewRound = (gameId: string, playerId: string) => {
    const games = getGames();
    const game = games[gameId];
    if(!game || !game.players.find(p=>p.id === playerId)?.isHost) return;

    const nextStarter = (game.roundStarterIndex + 1) % 4;
    _startRoundLogic(game, nextStarter);
    saveGames(games);
}

export const resetGame = (gameId: string, playerId: string) => {
    const games = getGames();
    const game = games[gameId];
    if(!game || !game.players.find(p=>p.id === playerId)?.isHost) return;

    game.scores = { A: 0, B: 0 };
    _startRoundLogic(game, 0);
    saveGames(games);
}

export const onGameStateUpdate = (gameId: string, callback: (game: Game | null) => void): (() => void) => {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === GAMES_STORAGE_KEY) {
      const games = getGames();
      callback(games[gameId] || null);
    }
  };

  // Listen to changes in other tabs
  window.addEventListener('storage', handleStorageChange);
  
  // Polling for changes made in the same tab
  let lastState = JSON.stringify(getGames()[gameId]);
  const intervalId = setInterval(() => {
    const games = getGames();
    const currentState = JSON.stringify(games[gameId]);
    if (currentState !== lastState) {
        lastState = currentState;
        callback(games[gameId] || null);
    }
  }, 250);

  // Return an unsubscribe function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    clearInterval(intervalId);
  };
};
