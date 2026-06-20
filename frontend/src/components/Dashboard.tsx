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
  const paidWorkers = player.workers.filter(w => w.is_paid).length;
  const unpaidWorkers = player.workers.filter(w => !w.is_paid).length;
  const totalSalary = player.workers.reduce((sum, w) => sum + w.salary, 0);

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

      {/* Информация о рабочих и зарплате */}
      <div className="workers-status" style={{
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '10px',
        padding: '15px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ color: '#ffd700' }}>👥 Рабочие:</span>
          <span style={{ color: '#fff' }}>{player.workers.length}/{player.max_workers}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ color: '#51cf66' }}>✅ Работают:</span>
          <span style={{ color: '#51cf66' }}>{paidWorkers}</span>
        </div>
        
        {unpaidWorkers > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ color: '#ff6b6b' }}>❌ Без зарплаты:</span>
            <span style={{ color: '#ff6b6b' }}>{unpaidWorkers}</span>
          </div>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ color: '#ffd700' }}>💰 Зарплата в минуту:</span>
          <span style={{ color: '#ffd700' }}>{totalSalary * 12}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#d4a574' }}>💸 Всего выплачено:</span>
          <span style={{ color: '#d4a574' }}>{player.total_salary_expense}</span>
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
    </div>
  );
};

export default Dashboard;