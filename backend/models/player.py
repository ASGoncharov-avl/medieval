from pydantic import BaseModel
from typing import Dict, List
from enum import Enum
from .resources import ResourceType, ResourceStorage

class WorkerType(str, Enum):
    LUMBERJACK = "lumberjack"    # добывает дерево
    MINER_STONE = "miner_stone"  # добывает камень
    MINER_METAL = "miner_metal"  # добывает металл
    CARPENTER = "carpenter"      # перерабатывает дерево в доски
    MASON = "mason"              # перерабатывает камень в кирпичи
    BLACKSMITH = "blacksmith"    # перерабатывает металл в инструменты

class Worker(BaseModel):
    id: int
    type: WorkerType
    name: str
    level: int = 1
    efficiency: float = 1.0
    cost_gold_per_day: int = 5
    
    # Базовая производительность в единицах в минуту
    base_production: Dict[WorkerType, int] = {
        WorkerType.LUMBERJACK: 2,
        WorkerType.MINER_STONE: 1,
        WorkerType.MINER_METAL: 1,
        WorkerType.CARPENTER: 1,
        WorkerType.MASON: 1,
        WorkerType.BLACKSMITH: 1
    }
    
    class Config:
        # Разрешаем использовать Enum как ключи словаря
        use_enum_values = True
    
    def get_production_rate(self) -> float:
        return self.base_production[self.type] * self.level * self.efficiency

class Player(BaseModel):
    id: str
    name: str
    gold: int = 100
    storage: ResourceStorage = ResourceStorage()
    workers: List[Worker] = []
    max_workers: int = 5
    level: int = 1
    experience: int = 0