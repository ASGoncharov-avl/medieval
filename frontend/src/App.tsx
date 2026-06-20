import React, { useState } from 'react';
import { GameState, Player } from './types/game';
import { api } from './services/api';
import { GameWebSocket } from './services/websocket';
import Dashboard from './components/Dashboard';
import MarketPanel from './components/MarketPanel';
import WorkerPanel from './components/WorkerPanel';
import BuildingPanel from './components/BuildingPanel';
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

  const handlePlayerUpdate = (updatedPlayer: Player) => {
    setPlayer(updatedPlayer);
  };

  return (
    <div className="app-container">
      {!player ? (
        <div className="login-panel">
          <div className="heraldry">
            <div className="heraldry-icon">🏰</div>
          </div>
          <h1 className="medieval-title">⚔️ Medieval Trader ⚔️</h1>
          <p style={{ color: '#d4a574', marginBottom: '30px', fontSize: '1.2em' }}>
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
            🏰 Владения лорда {player.name}
          </h1>
          
          <div className="game-grid">
            <Dashboard 
              player={gameState?.player || player} 
              onUpdate={handlePlayerUpdate}
            />
            <MarketPanel 
              market={gameState?.market} 
              playerId={player.id}
              onUpdate={handlePlayerUpdate}
            />
          </div>
          
          <div style={{ marginTop: '12px' }}>
            <WorkerPanel 
              player={gameState?.player || player}
              onUpdate={handlePlayerUpdate}
            />
          </div>

          <div style={{ marginTop: '12px' }}>
            <BuildingPanel 
              player={gameState?.player || player}
              onUpdate={handlePlayerUpdate}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;