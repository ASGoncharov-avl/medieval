import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, ResourceType } from '../types/game';
import { api } from '../services/api';

interface DashboardProps {
  player: Player;
  onUpdate: (player: Player) => void;
}

const resourceNames: Record<ResourceType, { name: string; icon: string }> = {
  [ResourceType.WOOD]: { name: 'Дерево', icon: '🌲' },
  [ResourceType.STONE]: { name: 'Камень', icon: '🪨' },
  [ResourceType.METAL]: { name: 'Металл', icon: '⛏️' },
  [ResourceType.PLANKS]: { name: 'Доски', icon: '🪵' },
  [ResourceType.BRICKS]: { name: 'Кирпичи', icon: '🧱' },
  [ResourceType.TOOLS]: { name: 'Инструменты', icon: '🔧' },
};

const Dashboard: React.FC<DashboardProps> = ({ player, onUpdate }) => {
  const [sellAmounts, setSellAmounts] = useState<Record<string, number>>({});
  const [autoSell, setAutoSell] = useState<Record<string, boolean>>({});
  const [autoSellThreshold, setAutoSellThreshold] = useState<Record<string, number>>({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // 🔥 ВАЖНО: Используем ref для хранения актуального player
  const playerRef = useRef(player);
  
  // 🔥 Обновляем ref каждый раз когда player меняется
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  const paidWorkers = player.workers.filter(w => w.is_paid).length;
  const unpaidWorkers = player.workers.filter(w => !w.is_paid).length;
  const totalSalary = player.workers.reduce((sum, w) => sum + w.salary, 0);

  const showMessage = useCallback((text: string, type: string) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 2000);
  }, []);

  const handleQuickSell = useCallback(async (resourceType: ResourceType, amount: number) => {
    if (amount <= 0) return;
    
    const result = await api.sellResource(playerRef.current.id, resourceType, amount);
    if (result.success) {
      onUpdate(result.player);
      showMessage(`✅ Продано ${amount} ${resourceType}`, 'success');
    } else {
      showMessage('❌ ' + result.message, 'error');
    }
  }, [onUpdate, showMessage]);

  const handleSellAll = useCallback(async (resourceType: ResourceType) => {
    const amount = playerRef.current.storage.resources[resourceType];
    if (amount > 0) {
      await handleQuickSell(resourceType, amount);
    }
  }, [handleQuickSell]);

  const toggleAutoSell = useCallback((resourceType: string) => {
    setAutoSell(prev => {
      const newState = { ...prev, [resourceType]: !prev[resourceType] };
      
      // Если включили авто-продажу, устанавливаем порог по умолчанию
      if (newState[resourceType]) {
        setAutoSellThreshold(prevThreshold => ({
          ...prevThreshold,
          [resourceType]: prevThreshold[resourceType] || 50
        }));
        showMessage(`🔄 Авто-продажа ${resourceType} включена`, 'success');
      } else {
        showMessage(`🔴 Авто-продажа ${resourceType} отключена`, 'error');
      }
      
      return newState;
    });
  }, [showMessage]);

  // 🔥 ИСПРАВЛЕНО: Авто-продажа с использованием ref
  useEffect(() => {
    const interval = setInterval(async () => {
      const currentPlayer = playerRef.current; // Берем актуальные данные
      
      // Проходим по всем типам ресурсов где включена авто-продажа
      for (const [type, enabled] of Object.entries(autoSell)) {
        if (!enabled) continue;
        
        const resourceType = type as ResourceType;
        const currentAmount = currentPlayer.storage.resources[resourceType];
        const threshold = autoSellThreshold[type] || 50;
        
        if (currentAmount > threshold) {
          const sellAmount = currentAmount - threshold;
          console.log(`🔄 Авто-продажа: ${type} (есть ${currentAmount}, порог ${threshold}, продаем ${sellAmount})`);
          
          const result = await api.sellResource(currentPlayer.id, resourceType, sellAmount);
          if (result.success) {
            onUpdate(result.player);
          }
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [autoSell, autoSellThreshold, onUpdate]); // Не добавляем player в зависимости!

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

      {message && (
        <div className={`game-message game-message-${messageType}`} style={{ marginBottom: '15px' }}>
          {message}
        </div>
      )}

      <div style={{
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
            
            <div style={{ marginTop: '10px', display: 'flex', gap: '5px', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button
                  className="medieval-button"
                  onClick={() => handleQuickSell(type as ResourceType, 1)}
                  disabled={amount < 1}
                  style={{ flex: 1, padding: '5px', fontSize: '0.7em' }}
                >
                  -1
                </button>
                <button
                  className="medieval-button"
                  onClick={() => handleQuickSell(type as ResourceType, 10)}
                  disabled={amount < 10}
                  style={{ flex: 1, padding: '5px', fontSize: '0.7em' }}
                >
                  -10
                </button>
              </div>
              <button
                className="medieval-button"
                onClick={() => handleSellAll(type as ResourceType)}
                disabled={amount === 0}
                style={{ padding: '5px', fontSize: '0.75em', background: 'linear-gradient(180deg, #228B22 0%, #006400 100%)' }}
              >
                💰 Продать всё
              </button>
              
              <div style={{ marginTop: '5px' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '5px',
                  color: autoSell[type] ? '#51cf66' : '#8b7355',
                  fontSize: '0.7em',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={autoSell[type] || false}
                    onChange={() => toggleAutoSell(type)}
                    style={{ cursor: 'pointer' }}
                  />
                  {autoSell[type] ? '🔄 Авто ON' : '⚪ Авто OFF'}
                </label>
                
                {autoSell[type] && (
                  <div style={{ marginTop: '5px' }}>
                    <input
                      type="number"
                      value={autoSellThreshold[type] || 50}
                      onChange={(e) => setAutoSellThreshold(prev => ({
                        ...prev,
                        [type]: parseInt(e.target.value) || 0
                      }))}
                      style={{
                        width: '100%',
                        padding: '3px',
                        fontSize: '0.7em',
                        background: '#2d1f0e',
                        border: '1px solid #8b7355',
                        borderRadius: '4px',
                        color: '#ffd700',
                        textAlign: 'center'
                      }}
                    />
                    <div style={{ color: '#8b7355', fontSize: '0.6em', marginTop: '2px' }}>
                      Оставить: {autoSellThreshold[type] || 50}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;