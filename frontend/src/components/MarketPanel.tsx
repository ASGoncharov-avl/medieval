import React, { useState } from 'react';
import { MarketPrices, Player } from '../types/game';
import { api } from '../services/api';

interface MarketPanelProps {
  market?: MarketPrices;
  playerId: string;
  onUpdate: (player: Player) => void;
}

const resourceNames: Record<string, string> = {
  wood: '🌲 Дерево',
  stone: '🪨 Камень',
  iron: '⛏️ Руда',
  planks: '🪵 Доски',
  bricks: '🧱 Кирпичи',
  tools: '🔧 Инструменты',
};

const MarketPanel: React.FC<MarketPanelProps> = ({ market, playerId, onUpdate }) => {
  const [selectedResource, setSelectedResource] = useState('wood');
  const [amount, setAmount] = useState(1);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleTrade = async (action: 'buy' | 'sell') => {
    const fn = action === 'buy' ? api.buyResource : api.sellResource;
    const result = await fn(playerId, selectedResource, amount);
    
    if (result.success) {
      onUpdate(result.player);
      setMessage(`✅ ${action === 'buy' ? 'Куплено' : 'Продано'}!`);
      setMessageType('success');
    } else {
      setMessage('❌ ' + result.message);
      setMessageType('error');
    }
    setTimeout(() => { setMessage(''); setMessageType(''); }, 2000);
  };

  return (
    <div className="panel">
      <h2 className="panel-title">🏪 Рынок</h2>
      
      {market ? (
        <div>
          {/* Компактные цены в 3 колонки */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', marginBottom: '12px' }}>
            {Object.entries(market).map(([type, prices]) => (
              <div key={type} style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '6px',
                borderRadius: '6px',
                textAlign: 'center',
                fontSize: '0.7em'
              }}>
                <div style={{ fontSize: '1.2em' }}>{resourceNames[type]?.split(' ')[0]}</div>
                <div style={{ color: '#d4a574', fontSize: '0.9em' }}>{resourceNames[type]?.split(' ')[1]}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', gap: '2px' }}>
                  <span style={{ color: '#ff6b6b' }}>🛒{prices.buy_price}</span>
                  <span style={{ color: '#51cf66' }}>💰{prices.sell_price}</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Торговля */}
          <div className="trade-section">
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              <select className="trade-select" value={selectedResource} 
                onChange={(e) => setSelectedResource(e.target.value)}
                style={{ flex: 2, padding: '6px', fontSize: '0.8em' }}>
                {Object.keys(resourceNames).map((type) => (
                  <option key={type} value={type}>{resourceNames[type]}</option>
                ))}
              </select>
              <input className="trade-input" type="number" min="1" value={amount}
                onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ flex: 1, padding: '6px', fontSize: '0.8em' }} />
            </div>
            
            <div className="trade-buttons">
              <button className="medieval-button" onClick={() => handleTrade('buy')} style={{ flex: 1 }}>
                Купить
              </button>
              <button className="medieval-button" onClick={() => handleTrade('sell')} style={{ flex: 1 }}>
                Продать
              </button>
            </div>
            
            {message && (
              <div className={`game-message game-message-${messageType}`} style={{ marginTop: '8px' }}>
                {message}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px' }}>⏳ Загрузка рынка...</div>
      )}
    </div>
  );
};

export default MarketPanel;