from pydantic import BaseModel
from typing import Dict, List
from enum import Enum
from .resources import ResourceType, ResourceStorage

class WorkerType(str, Enum):
    LUMBERJACK = "lumberjack"
    MINER_STONE = "miner_stone"
    MINER_METAL = "miner_metal"
    CARPENTER = "carpenter"
    MASON = "mason"
    BLACKSMITH = "blacksmith"

class Worker(BaseModel):
    id: int
    type: WorkerType
    name: str
    level: int = 1
    efficiency: float = 1.0
    salary: int = 0  # зарплата в цикл (5 секунд)
    is_paid: bool = True  # оплачен ли в этом цикле
    
    # Базовая производительность в единицах за цикл
    base_production: Dict[WorkerType, int] = {
        WorkerType.LUMBERJACK: 2,
        WorkerType.MINER_STONE: 1,
        WorkerType.MINER_METAL: 1,
        WorkerType.CARPENTER: 1,
        WorkerType.MASON: 1,
        WorkerType.BLACKSMITH: 1
    }
    
    # Базовая зарплата за цикл
    base_salary: Dict[WorkerType, int] = {
        WorkerType.LUMBERJACK: 3,
        WorkerType.MINER_STONE: 5,
        WorkerType.MINER_METAL: 7,
        WorkerType.CARPENTER: 6,
        WorkerType.MASON: 6,
        WorkerType.BLACKSMITH: 10,
    }
    
    class Config:
        use_enum_values = True
    
    def get_production_rate(self) -> float:
        if not self.is_paid:
            return 0  # без зарплаты не работают
        return self.base_production[self.type] * self.level * self.efficiency
    
    def get_salary(self) -> int:
        return self.base_salary[self.type] * self.level

class Player(BaseModel):
    id: str
    name: str
    gold: int = 100
    storage: ResourceStorage = ResourceStorage()
    workers: List[Worker] = []
    max_workers: int = 5
    level: int = 1
    experience: int = 0
    total_salary_expense: int = 0  # общие расходы на зарплату