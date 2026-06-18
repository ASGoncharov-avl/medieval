import React, { useState } from 'react';
import { GameState, Player } from './types/game';
import { api } from './services/api';
import { GameWebSocket } from './services/websocket';
import Dashboard from './components/Dashboard';
import MarketPanel from './components/MarketPanel';
import WorkerPanel from './components/WorkerPanel';
import './App.css';

function App() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [gameState, setGameState] = useState<GameState | null>(null);

  const handleCreatePlayer = async () => {
    if (!playerName.trim()) return;
    
    const data = await api.createPlayer(playerName);
    setPlayer(data.player);
    
    const ws = new GameWebSocket(data.player_id, (newState) => {
      setGameState(newState);
    });
    ws.connect();
  };

  return (
    <div className="app-container">
      {!player ? (
        <div className="login-panel">
          <h1 className="medieval-title">⚔️ Medieval Trader ⚔️</h1>
          <p style={{ color: '#A0522D', marginBottom: '30px', fontSize: '1.2em' }}>
            Станьте лордом средневекового поместья!
          </p>
          
          <div>
            <input
              className="login-input"
              placeholder="Имя вашего лорда"
              value={playerName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlayerName(e.target.value)}
              onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && handleCreatePlayer()}
            />
            <button className="medieval-button" onClick={handleCreatePlayer}>
              Начать игру
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h1 className="medieval-title">
            Владения лорда {player.name}
          </h1>
          
          <div className="game-grid">
            <Dashboard player={gameState?.player || player} />
            <MarketPanel 
              market={gameState?.market} 
              playerId={player.id}
              onUpdate={(updatedPlayer: Player) => setPlayer(updatedPlayer)}
            />
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <WorkerPanel 
              player={gameState?.player || player}
              onUpdate={(updatedPlayer: Player) => setPlayer(updatedPlayer)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;