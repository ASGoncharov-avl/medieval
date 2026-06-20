from pydantic import BaseModel
from typing import Dict, List
from enum import Enum
from .resources import ResourceType, ResourceStorage, BuildingType, Building

class WorkerType(str, Enum):
    LUMBERJACK = "lumberjack"
    MINER_STONE = "miner_stone"
    MINER_IRON = "miner_iron"
    CARPENTER = "carpenter"
    MASON = "mason"
    BLACKSMITH = "blacksmith"

class Worker(BaseModel):
    id: int
    type: WorkerType
    name: str
    level: int = 1
    efficiency: float = 1.0
    salary: int = 0
    is_paid: bool = True
    assigned_to: str = ""  # ID здания, к которому привязан
    
    base_production: Dict[WorkerType, int] = {
        WorkerType.LUMBERJACK: 2,
        WorkerType.MINER_STONE: 1,
        WorkerType.MINER_IRON: 1,
        WorkerType.CARPENTER: 1,
        WorkerType.MASON: 1,
        WorkerType.BLACKSMITH: 1,
    }
    
    base_salary: Dict[WorkerType, int] = {
        WorkerType.LUMBERJACK: 3,
        WorkerType.MINER_STONE: 5,
        WorkerType.MINER_IRON: 7,
        WorkerType.CARPENTER: 6,
        WorkerType.MASON: 6,
        WorkerType.BLACKSMITH: 10,
    }
    
    class Config:
        use_enum_values = True
    
    def get_production_rate(self) -> float:
        if not self.is_paid:
            return 0
        return self.base_production[self.type] * self.level * self.efficiency
    
    def get_salary(self) -> int:
        return self.base_salary[self.type] * self.level

class Player(BaseModel):
    id: str
    name: str
    gold: int = 100
    storage: ResourceStorage = ResourceStorage()
    workers: List[Worker] = []
    buildings: List[Building] = []
    max_workers: int = 5
    level: int = 1
    experience: int = 0
    total_salary_expense: int = 0