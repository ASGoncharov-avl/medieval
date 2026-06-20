import React, { useState, useEffect } from 'react';
import { Player, BuildingType, BuildingInfo } from '../types/game';
import { api } from '../services/api';

interface BuildingPanelProps {
  player: Player;
  onUpdate: (player: Player) => void;
}

const buildingIcons: Record<string, string> = {
  lumber_mill: '🪚',
  stonemason: '🧱',
  smithy: '🔨',
  warehouse: '📦',
  marketplace: '🏪',
};

const BuildingPanel: React.FC<BuildingPanelProps> = ({ player, onUpdate }) => {
  const [buildingsInfo, setBuildingsInfo] = useState<Record<string, BuildingInfo>>({});
  const [activeTab, setActiveTab] = useState<'buildings' | 'build'>('buildings');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    api.getBuildingsInfo().then(data => setBuildingsInfo(data));
  }, []);

  const showMessage = (text: string, type: string) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => { setMessage(''); setMessageType(''); }, 3000);
  };

  const isBuilt = (type: string) => {
    return player.buildings.some(b => b.type === type);
  };

  const getBuilding = (type: string) => {
    return player.buildings.find(b => b.type === type);
  };

  const handleBuild = async (buildingType: string) => {
    const result = await api.buildBuilding(player.id, buildingType);
    if (result.success) {
      onUpdate(result.player);
      showMessage('✅ Построено!', 'success');
    } else {
      showMessage('❌ ' + result.message, 'error');
    }
  };

  const handleHireWorker = async (buildingType: string) => {
    const result = await api.hireBuildingWorker(player.id, buildingType);
    if (result.success) {
      onUpdate(result.player);
      showMessage('✅ Нанят рабочий!', 'success');
    } else {
      showMessage('❌ ' + result.message, 'error');
    }
  };

  const canAfford = (info: BuildingInfo) => {
    if (player.gold < info.build_cost_gold) return false;
    for (const [res, amount] of Object.entries(info.build_cost_resources)) {
      if ((player.storage.resources as any)[res] < amount) return false;
    }
    return true;
  };

  return (
    <div className="panel">
      <h2 className="panel-title">🏗️ Строения</h2>

      {/* Табы */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button
          className="medieval-button"
          onClick={() => setActiveTab('buildings')}
          style={{
            flex: 1,
            padding: '8px',
            fontSize: '0.85em',
            background: activeTab === 'buildings' 
              ? 'linear-gradient(180deg, #a0522d 0%, #8b4513 100%)' 
              : undefined,
            border: activeTab === 'buildings' ? '2px solid #ffd700' : undefined
          }}
        >
          🏰 Построенные ({player.buildings.length})
        </button>
        <button
          className="medieval-button"
          onClick={() => setActiveTab('build')}
          style={{
            flex: 1,
            padding: '8px',
            fontSize: '0.85em',
            background: activeTab === 'build' 
              ? 'linear-gradient(180deg, #a0522d 0%, #8b4513 100%)' 
              : undefined,
            border: activeTab === 'build' ? '2px solid #ffd700' : undefined
          }}
        >
          🔨 Построить
        </button>
      </div>

      {message && (
        <div className={`game-message game-message-${messageType}`}>
          {message}
        </div>
      )}

      {/* Вкладка "Построенные" */}
      {activeTab === 'buildings' && (
        <div>
          {player.buildings.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px', 
              color: '#8b7355',
              fontSize: '0.9em'
            }}>
              <div style={{ fontSize: '2em', marginBottom: '8px' }}>🏚️</div>
              Нет построенных зданий.<br/>
              Перейдите во вкладку "Построить"
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {player.buildings.map(building => {
                const info = buildingsInfo[building.type];
                if (!info) return null;
                
                return (
                  <div key={building.type} style={{
                    background: 'rgba(81, 207, 102, 0.1)',
                    border: '1px solid #51cf66',
                    borderRadius: '8px',
                    padding: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '1.8em' }}>
                        {buildingIcons[building.type] || '🏗️'}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#ffd700', fontWeight: 'bold', fontSize: '1em' }}>
                          {info.name}
                        </div>
                        <div style={{ color: '#51cf66', fontSize: '0.8em' }}>
                          Уровень {building.level}
                        </div>
                      </div>
                    </div>

                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '6px',
                      fontSize: '0.75em',
                      color: '#d4a574',
                      marginBottom: '8px'
                    }}>
                      <div>💰 Обслуживание: {building.maintenance}/мин</div>
                      {info.worker_slots > 0 && (
                        <div>👷 Рабочие: {building.current_workers}/{building.worker_slots * building.level}</div>
                      )}
                      {building.bonus_percent > 0 && (
                        <div>📈 Бонус: +{building.bonus_percent * building.level}%</div>
                      )}
                    </div>

                    {/* Кнопки действий */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {info.worker_slots > 0 && building.current_workers < building.worker_slots * building.level && (
                        <button
                          className="medieval-button"
                          onClick={() => handleHireWorker(building.type)}
                          style={{ flex: 1, padding: '6px', fontSize: '0.7em' }}
                        >
                          👷 Нанять
                        </button>
                      )}
                      <button
                        className="medieval-button"
                        style={{ 
                          flex: 1, 
                          padding: '6px', 
                          fontSize: '0.7em',
                          background: 'linear-gradient(180deg, #8B0000 0%, #600000 100%)',
                          border: '1px solid #ff4444'
                        }}
                        title="Снести здание (будет добавлено позже)"
                      >
                        💥 Снести
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Вкладка "Построить" */}
      {activeTab === 'build' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {Object.entries(buildingsInfo).map(([type, info]) => {
            const built = isBuilt(type);
            
            return (
              <div key={type} style={{
                background: built ? 'rgba(81, 207, 102, 0.05)' : 'rgba(0,0,0,0.3)',
                border: built ? '1px solid #51cf66' : '1px solid #8b7355',
                borderRadius: '8px',
                padding: '8px',
                fontSize: '0.7em',
                opacity: built ? 0.6 : 1
              }}>
                <div style={{ textAlign: 'center', fontSize: '1.5em', marginBottom: '4px' }}>
                  {buildingIcons[type] || '🏗️'}
                </div>
                <div style={{ color: '#ffd700', textAlign: 'center', fontWeight: 'bold', marginBottom: '4px' }}>
                  {info.name}
                </div>
                <div style={{ color: '#d4a574', textAlign: 'center', fontSize: '0.9em', marginBottom: '6px' }}>
                  {info.description}
                </div>
                
                <div style={{ marginBottom: '6px' }}>
                  <div style={{ color: '#ffd700', fontSize: '0.9em', marginBottom: '2px' }}>
                    💰 {info.build_cost_gold} золота
                  </div>
                  {Object.entries(info.build_cost_resources).map(([res, amount]) => (
                    <div key={res} style={{ color: '#d4a574', fontSize: '0.85em' }}>
                      + {amount} {res}
                    </div>
                  ))}
                </div>

                {info.worker_slots > 0 && (
                  <div style={{ color: '#51cf66', fontSize: '0.8em', marginBottom: '4px' }}>
                    👷 Слотов: {info.worker_slots}
                  </div>
                )}
                
                {info.bonus_percent > 0 && (
                  <div style={{ color: '#51cf66', fontSize: '0.8em', marginBottom: '4px' }}>
                    📈 Бонус: +{info.bonus_percent}%
                  </div>
                )}

                <div style={{ color: '#ff6b6b', fontSize: '0.8em', marginBottom: '6px' }}>
                  🔧 Обслуживание: {info.maintenance} 💰/мин
                </div>

                <button
                  className="medieval-button"
                  onClick={() => handleBuild(type)}
                  disabled={built || !canAfford(info)}
                  style={{ 
                    width: '100%', 
                    padding: '5px', 
                    fontSize: '0.75em',
                    opacity: built ? 0.5 : 1
                  }}
                >
                  {built ? '✅ Построено' : '🔨 Построить'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BuildingPanel;