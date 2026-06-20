import React, { useState } from 'react';
import { Player, WorkerType } from '../types/game';
import { api } from '../services/api';

interface WorkerPanelProps {
  player: Player;
  onUpdate: (player: Player) => void;
}

const workerInfo: Record<WorkerType, { name: string; icon: string; cost: number; salary: number; description: string }> = {
  [WorkerType.LUMBERJACK]: { name: 'Лесоруб', icon: '🪓', cost: 50, salary: 3, description: 'Добывает дерево' },
  [WorkerType.MINER_STONE]: { name: 'Каменолом', icon: '⛏️', cost: 75, salary: 5, description: 'Добывает камень' },
  [WorkerType.MINER_METAL]: { name: 'Рудокоп', icon: '⚒️', cost: 100, salary: 7, description: 'Добывает металл' },
  [WorkerType.CARPENTER]: { name: 'Плотник', icon: '🪚', cost: 80, salary: 6, description: 'Делает доски' },
  [WorkerType.MASON]: { name: 'Каменщик', icon: '🧱', cost: 80, salary: 6, description: 'Делает кирпичи' },
  [WorkerType.BLACKSMITH]: { name: 'Кузнец', icon: '🔨', cost: 120, salary: 10, description: 'Кует инструменты' },
};

const WorkerPanel: React.FC<WorkerPanelProps> = ({ player, onUpdate }) => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleHire = async (workerType: WorkerType) => {
    const result = await api.hireWorker(player.id, workerType);
    if (result.success) {
      onUpdate(result.player);
      setMessage('✅ Нанят новый рабочий!');
      setMessageType('success');
    } else {
      setMessage('❌ ' + result.message);
      setMessageType('error');
    }
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const totalSalary = player.workers.reduce((sum, w) => sum + w.salary, 0);

  return (
    <div className="panel">
      <h2 className="panel-title">👥 Гильдия рабочих</h2>
      
      <div style={{ 
        background: 'rgba(0,0,0,0.3)', 
        borderRadius: '10px', 
        padding: '15px', 
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <div style={{ color: '#ffd700', fontSize: '1.2em', fontFamily: 'MedievalSharp, cursive', marginBottom: '10px' }}>
          Рабочих в поместье: {player.workers.length} / {player.max_workers}
        </div>
        <div style={{ color: '#ff6b6b', fontSize: '1.1em' }}>
          💰 Расход на зарплату: {totalSalary * 12} золотых/мин
        </div>
      </div>
      
      {message && (
        <div className={`game-message game-message-${messageType}`}>
          {message}
        </div>
      )}
      
      <div className="worker-grid">
        {Object.entries(workerInfo).map(([type, info]) => (
          <div className="worker-card" key={type}>
            <div className="worker-icon">{info.icon}</div>
            <div className="worker-name">{info.name}</div>
            <div style={{ color: '#d4a574', fontSize: '0.9em', marginBottom: '8px' }}>
              {info.description}
            </div>
            <div style={{ color: '#51cf66', marginBottom: '5px', fontSize: '0.9em' }}>
              💰 Зарплата: {info.salary}/цикл
            </div>
            <div className="worker-cost" style={{ color: '#ffd700' }}>
              💎 Найм: {info.cost} золотых
            </div>
            <button
              className="medieval-button"
              onClick={() => handleHire(type as WorkerType)}
              disabled={player.workers.length >= player.max_workers || player.gold < info.cost}
              style={{ width: '100%', fontSize: '1em', padding: '10px' }}
            >
              Нанять
            </button>
          </div>
        ))}
      </div>
      
      {player.workers.length > 0 && (
        <div className="active-workers">
          <h3 className="active-workers-title">👷 Ваши работники:</h3>
          <div className="worker-list">
            {player.workers.map((worker) => (
              <div 
                className="active-worker" 
                key={worker.id}
                style={{
                  border: worker.is_paid ? '1px solid #51cf66' : '1px solid #ff6b6b',
                  opacity: worker.is_paid ? 1 : 0.6
                }}
              >
                <div className="active-worker-icon">
                  {workerInfo[worker.type].icon}
                  {!worker.is_paid && <span style={{ color: '#ff6b6b', marginLeft: '5px' }}>⚠️</span>}
                </div>
                <div className="active-worker-name">
                  {workerInfo[worker.type].name}
                </div>
                <div className="active-worker-level">
                  Уровень: {worker.level} | 💰{worker.salary}
                </div>
                <div style={{ 
                  fontSize: '0.8em', 
                  color: worker.is_paid ? '#51cf66' : '#ff6b6b',
                  marginTop: '5px'
                }}>
                  {worker.is_paid ? '✅ Работает' : '❌ Не оплачен'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerPanel;