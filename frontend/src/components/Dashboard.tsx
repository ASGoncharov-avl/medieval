import React from 'react';
import { Player, ResourceType } from '../types/game';

interface DashboardProps {
  player: Player;
}

const resourceNames: Record<ResourceType, { name: string; icon: string }> = {
  [ResourceType.WOOD]: { name: 'Дерево', icon: '🌲' },
  [ResourceType.STONE]: { name: 'Камень', icon: '🪨' },
  [ResourceType.METAL]: { name: 'Металл', icon: '⛏️' },
  [ResourceType.PLANKS]: { name: 'Доски', icon: '🪵' },
  [ResourceType.BRICKS]: { name: 'Кирпичи', icon: '🧱' },
  [ResourceType.TOOLS]: { name: 'Инструменты', icon: '🔧' },
};

const Dashboard: React.FC<DashboardProps> = ({ player }) => {
  return (
    <div className="panel">
      <h2 className="panel-title">🏰 Ресурсы и Статистика</h2>
      
      <div className="gold-display">
        <div style={{ fontSize: '1.2em', color: '#d4a574' }}>Золотые монеты</div>
        <div className="gold-amount">{player.gold}</div>
        <div style={{ color: '#d4a574', marginTop: '10px', fontSize: '1.1em' }}>
          ⭐ Уровень: {player.level} | 📈 Опыт: {player.experience}/{player.level * 100}
        </div>
      </div>
      
      <h3 style={{ color: '#ffd700', marginBottom: '15px', fontFamily: 'MedievalSharp, cursive' }}>
        📦 Склад ресурсов
      </h3>
      
      <div className="resources-grid">
        {Object.entries(player.storage.resources).map(([type, amount]) => (
          <div className="resource-card" key={type}>
            <div className="resource-icon">
              {resourceNames[type as ResourceType]?.icon || '📦'}
            </div>
            <div className="resource-name">
              {resourceNames[type as ResourceType]?.name || type}
            </div>
            <div className="resource-amount">{amount}</div>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '20px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', textAlign: 'center' }}>
        <span style={{ color: '#ffd700', fontSize: '1.2em' }}>
          👥 Рабочие: {player.workers.length}/{player.max_workers}
        </span>
      </div>
    </div>
  );
};

export default Dashboard;