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

      {message && (
        <div className={`game-message game-message-${messageType}`}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        {Object.entries(buildingsInfo).map(([type, info]) => {
          const built = isBuilt(type);
          const building = getBuilding(type);
          
          return (
            <div key={type} style={{
              background: built ? 'rgba(81, 207, 102, 0.1)' : 'rgba(0,0,0,0.3)',
              border: built ? '1px solid #51cf66' : '1px solid #8b7355',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '0.75em'
            }}>
              <div style={{ textAlign: 'center', fontSize: '1.8em', marginBottom: '5px' }}>
                {buildingIcons[type] || '🏗️'}
              </div>
              <div style={{ color: '#ffd700', textAlign: 'center', fontWeight: 'bold', marginBottom: '5px' }}>
                {info.name}
              </div>
              
              {built && building ? (
                <div>
                  <div style={{ color: '#51cf66', textAlign: 'center', fontSize: '0.85em', marginBottom: '5px' }}>
                    ✅ Построено (Ур.{building.level})
                  </div>
                  
                  {info.worker_slots > 0 && (
                    <div style={{ marginTop: '5px' }}>
                      <div style={{ color: '#d4a574', fontSize: '0.8em', textAlign: 'center' }}>
                        Рабочие: {building.current_workers}/{building.worker_slots * building.level}
                      </div>
                      
                      {building.current_workers < building.worker_slots * building.level && (
                        <button
                          className="medieval-button"
                          onClick={() => handleHireWorker(type)}
                          style={{ width: '100%', marginTop: '5px', padding: '5px', fontSize: '0.75em' }}
                        >
                          Нанять рабочего
                        </button>
                      )}
                    </div>
                  )}
                  
                  <div style={{ color: '#ff6b6b', fontSize: '0.7em', textAlign: 'center', marginTop: '5px' }}>
                    Обслуживание: {building.maintenance} 💰/мин
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ color: '#d4a574', marginBottom: '5px' }}>
                    <div style={{ fontSize: '0.8em', marginBottom: '3px' }}>
                      💰 {info.build_cost_gold} золота
                    </div>
                    {Object.entries(info.build_cost_resources).map(([res, amount]) => (
                      <div key={res} style={{ fontSize: '0.8em' }}>
                        {res}: {amount}
                      </div>
                    ))}
                  </div>
                  
                  <button
                    className="medieval-button"
                    onClick={() => handleBuild(type)}
                    disabled={!canAfford(info)}
                    style={{ width: '100%', padding: '5px', fontSize: '0.75em' }}
                  >
                    Построить
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BuildingPanel;