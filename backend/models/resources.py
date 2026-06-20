from enum import Enum
from pydantic import BaseModel
from typing import Dict

class ResourceType(str, Enum):
    WOOD = "wood"
    STONE = "stone"
    IRON = "iron"           # железная руда вместо metal
    PLANKS = "planks"
    BRICKS = "bricks"
    TOOLS = "tools"

class BuildingType(str, Enum):
    LUMBER_MILL = "lumber_mill"    # лесопилка
    STONEMASON = "stonemason"      # каменоломня
    SMITHY = "smithy"              # кузница
    WAREHOUSE = "warehouse"        # склад
    MARKETPLACE = "marketplace"    # рынок

class Building(BaseModel):
    type: BuildingType
    level: int = 1
    worker_slots: int = 1         # сколько рабочих можно нанять
    current_workers: int = 0      # нанято рабочих
    efficiency: float = 1.0       # эффективность
    
    # Стоимость строительства
    build_cost_gold: int = 0
    build_cost_resources: Dict[ResourceType, int] = {}
    
    # Стоимость улучшения (на следующий уровень)
    upgrade_cost_gold: int = 0
    upgrade_cost_resources: Dict[ResourceType, int] = {}
    
    # Пассивный бонус (для рынка и склада)
    bonus_percent: float = 0.0
    
    # Обслуживание (золота в минуту)
    maintenance: int = 0

class ResourceStorage(BaseModel):
    resources: Dict[ResourceType, int] = {
        ResourceType.WOOD: 0,
        ResourceType.STONE: 0,
        ResourceType.IRON: 0,
        ResourceType.PLANKS: 0,
        ResourceType.BRICKS: 0,
        ResourceType.TOOLS: 0,
    }
    
    class Config:
        use_enum_values = True
    
    def add_resource(self, resource_type: ResourceType, amount: int):
        self.resources[resource_type] += amount
        
    def remove_resource(self, resource_type: ResourceType, amount: int) -> bool:
        if self.resources[resource_type] >= amount:
            self.resources[resource_type] -= amount
            return True
        return False