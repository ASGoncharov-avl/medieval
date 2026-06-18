import React, { useState } from 'react';
import { Player, WorkerType } from '../types/game';
import { api } from '../services/api';

interface WorkerPanelProps {
  player: Player;
  onUpdate: (player: Player) => void;
}

const workerInfo: Record<WorkerType, { name: string; icon: string; cost: number; description: string }> = {
  [WorkerType.LUMBERJACK]: { name: 'Лесоруб', icon: '🪓', cost: 50, description: 'Добывает дерево' },
  [WorkerType.MINER_STONE]: { name: 'Каменолом', icon: '⛏️', cost: 75, description: 'Добывает камень' },
  [WorkerType.MINER_METAL]: { name: 'Рудокоп', icon: '⚒️', cost: 100, description: 'Добывает металл' },
  [WorkerType.CARPENTER]: { name: 'Плотник', icon: '🪚', cost: 80, description: 'Делает доски' },
  [WorkerType.MASON]: { name: 'Каменщик', icon: '🧱', cost: 80, description: 'Делает кирпичи' },
  [WorkerType.BLACKSMITH]: { name: 'Кузнец', icon: '🔨', cost: 120, description: 'Кует инструменты' },
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
    }, 3000);
  };

  return (
    <div className="panel">
      <h2 className="panel-title">👥 Гильдия рабочих</h2>
      
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '20px', 
        color: '#ffd700', 
        fontSize: '1.2em',
        fontFamily: 'MedievalSharp, cursive'
      }}>
        Рабочих в поместье: {player.workers.length} / {player.max_workers}
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
            <div className="worker-cost">💰 {info.cost} золотых</div>
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
              <div className="active-worker" key={worker.id}>
                <div className="active-worker-icon">{workerInfo[worker.type].icon}</div>
                <div className="active-worker-name">{workerInfo[worker.type].name}</div>
                <div className="active-worker-level">Уровень: {worker.level}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerPanel;