from enum import Enum
from pydantic import BaseModel
from typing import Dict

class ResourceType(str, Enum):
    WOOD = "wood"
    STONE = "stone" 
    METAL = "metal"
    PLANKS = "planks"
    BRICKS = "bricks"
    TOOLS = "tools"

class ResourceAmount(BaseModel):
    resource_type: ResourceType
    amount: int

class ResourceStorage(BaseModel):
    resources: Dict[ResourceType, int] = {
        ResourceType.WOOD: 0,
        ResourceType.STONE: 0,
        ResourceType.METAL: 0,
        ResourceType.PLANKS: 0,
        ResourceType.BRICKS: 0,
        ResourceType.TOOLS: 0
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