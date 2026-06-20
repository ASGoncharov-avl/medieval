import React, { useState } from 'react';
import { Player, WorkerType } from '../types/game';
import { api } from '../services/api';

interface WorkerPanelProps {
  player: Player;
  onUpdate: (player: Player) => void;
}

const basicWorkers = {
  [WorkerType.LUMBERJACK]: { name: 'Лесоруб', icon: '🪓', cost: 50, salary: 3, description: 'Добывает дерево' },
  [WorkerType.MINER_STONE]: { name: 'Каменолом', icon: '⛏️', cost: 75, salary: 5, description: 'Добывает камень' },
  [WorkerType.MINER_IRON]: { name: 'Рудокоп', icon: '⚒️', cost: 100, salary: 7, description: 'Добывает железо' },
};

const buildingWorkerNames: Record<string, string> = {
  lumber_mill: '🪚 Плотник',
  stonemason: '🧱 Каменщик',
  smithy: '🔨 Кузнец',
};

const WorkerPanel: React.FC<WorkerPanelProps> = ({ player, onUpdate }) => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleHire = async (workerType: WorkerType) => {
    const result = await api.hireWorker(player.id, workerType);
    if (result.success) {
      onUpdate(result.player);
      setMessage('✅ Нанят!');
      setMessageType('success');
    } else {
      setMessage('❌ ' + result.message);
      setMessageType('error');
    }
    setTimeout(() => { setMessage(''); setMessageType(''); }, 3000);
  };

  // Разделяем рабочих на базовых и привязанных к зданиям
  const basicWorkerList = player.workers.filter(w => !w.assigned_to);
  const buildingWorkerList = player.workers.filter(w => w.assigned_to);
  const totalSalary = player.workers.reduce((sum, w) => sum + w.salary, 0);

  return (
    <div className="panel">
      <h2 className="panel-title">👥 Рабочие ({player.workers.length}/{player.max_workers})</h2>

      <div style={{
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '8px',
        padding: '8px',
        marginBottom: '12px',
        textAlign: 'center',
        fontSize: '0.85em'
      }}>
        <span style={{ color: '#ff6b6b' }}>💰 Расход на зарплату: {totalSalary * 12} золотых/мин</span>
      </div>

      {message && (
        <div className={`game-message game-message-${messageType}`}>{message}</div>
      )}

      {/* Базовые рабочие */}
      <div style={{ marginBottom: '12px' }}>
        <h4 style={{ color: '#ffd700', fontSize: '0.9em', marginBottom: '8px' }}>⚒️ Добытчики</h4>
        <div className="worker-grid">
          {Object.entries(basicWorkers).map(([type, info]) => (
            <div className="worker-card" key={type}>
              <div className="worker-icon">{info.icon}</div>
              <div className="worker-name">{info.name}</div>
              <div style={{ color: '#d4a574', fontSize: '0.7em' }}>{info.description}</div>
              <div style={{ color: '#51cf66', fontSize: '0.7em' }}>💰{info.salary}/цикл</div>
              <div className="worker-cost">💎 {info.cost} золота</div>
              <button
                className="medieval-button"
                onClick={() => handleHire(type as WorkerType)}
                disabled={player.workers.length >= player.max_workers || player.gold < info.cost}
                style={{ width: '100%', fontSize: '0.7em', padding: '6px' }}
              >
                Нанять
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Рабочие в зданиях */}
      {buildingWorkerList.length > 0 && (
        <div>
          <h4 style={{ color: '#ffd700', fontSize: '0.9em', marginBottom: '8px' }}>🏗️ Рабочие в зданиях</h4>
          <div className="worker-list">
            {buildingWorkerList.map(worker => (
              <div className="active-worker" key={worker.id}
                style={{
                  border: worker.is_paid ? '1px solid #51cf66' : '1px solid #ff6b6b',
                  opacity: worker.is_paid ? 1 : 0.6
                }}>
                <div className="active-worker-icon">
                  {buildingWorkerNames[worker.assigned_to]?.split(' ')[0] || '👷'}
                </div>
                <div className="active-worker-name" style={{ fontSize: '0.7em' }}>
                  {buildingWorkerNames[worker.assigned_to] || worker.name}
                </div>
                <div style={{ fontSize: '0.65em', color: worker.is_paid ? '#51cf66' : '#ff6b6b' }}>
                  {worker.is_paid ? '✅' : '❌'} 💰{worker.salary}
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