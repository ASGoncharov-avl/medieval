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
  metal: '⛏️ Металл',
  planks: '🪵 Доски',
  bricks: '🧱 Кирпичи',
  tools: '🔧 Инструменты',
};

const MarketPanel: React.FC<MarketPanelProps> = ({ market, playerId, onUpdate }) => {
  const [selectedResource, setSelectedResource] = useState('wood');
  const [amount, setAmount] = useState(1);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleBuy = async () => {
    const result = await api.buyResource(playerId, selectedResource, amount);
    if (result.success) {
      onUpdate(result.player);
      setMessage('✅ ' + result.message);
      setMessageType('success');
    } else {
      setMessage('❌ ' + result.message);
      setMessageType('error');
    }
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  const handleSell = async () => {
    const result = await api.sellResource(playerId, selectedResource, amount);
    if (result.success) {
      onUpdate(result.player);
      setMessage('✅ ' + result.message);
      setMessageType('success');
    } else {
      setMessage('❌ ' + result.message);
      setMessageType('error');
    }
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  return (
    <div className="panel">
      <h2 className="panel-title">🏪 Торговая площадь</h2>
      
      {market ? (
        <div>
          <div style={{ maxHeight: '300px', overflow: 'auto', marginBottom: '20px' }}>
            {Object.entries(market).map(([type, prices]) => (
              <div className="market-item" key={type}>
                <div style={{ color: '#ffd700', fontWeight: 'bold', fontSize: '1.1em' }}>
                  {resourceNames[type]}
                </div>
                <div className="price-row">
                  <span className="buy-price">Покупка: {prices.buy_price} 💰</span>
                  <span className="sell-price">Продажа: {prices.sell_price} 💰</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="trade-section">
            <h3 style={{ color: '#ffd700', marginBottom: '15px', fontFamily: 'MedievalSharp, cursive' }}>
              ⚖️ Совершить сделку
            </h3>
            
            <select 
              className="trade-select"
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value)}
            >
              {Object.keys(resourceNames).map((type) => (
                <option key={type} value={type}>
                  {resourceNames[type]}
                </option>
              ))}
            </select>
            
            <input
              className="trade-input"
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
              placeholder="Количество"
            />
            
            <div className="trade-buttons">
              <button className="medieval-button" onClick={handleBuy} style={{ flex: 1 }}>
                🛒 Купить
              </button>
              <button className="medieval-button" onClick={handleSell} style={{ flex: 1 }}>
                💰 Продать
              </button>
            </div>
            
            {message && (
              <div className={`game-message game-message-${messageType}`}>
                {message}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: '#d4a574', padding: '40px' }}>
          <div style={{ fontSize: '2em', marginBottom: '10px' }}>⚖️</div>
          Загрузка рыночных цен...
        </div>
      )}
    </div>
  );
};

export default MarketPanel;