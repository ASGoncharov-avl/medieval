from pydantic import BaseModel
from typing import Dict
from enum import Enum
from .resources import ResourceType
import random
from datetime import datetime

class MarketPrice(BaseModel):
    resource_type: ResourceType
    buy_price: int
    sell_price: int
    base_price: int
    volatility: float = 0.1

class Market(BaseModel):
    prices: Dict[ResourceType, MarketPrice] = {
        ResourceType.WOOD: MarketPrice(
            resource_type=ResourceType.WOOD,
            buy_price=10,
            sell_price=8,
            base_price=10
        ),
        ResourceType.STONE: MarketPrice(
            resource_type=ResourceType.STONE,
            buy_price=15,
            sell_price=12,
            base_price=15
        ),
        ResourceType.METAL: MarketPrice(
            resource_type=ResourceType.METAL,
            buy_price=25,
            sell_price=20,
            base_price=25
        ),
        ResourceType.PLANKS: MarketPrice(
            resource_type=ResourceType.PLANKS,
            buy_price=30,
            sell_price=25,
            base_price=30
        ),
        ResourceType.BRICKS: MarketPrice(
            resource_type=ResourceType.BRICKS,
            buy_price=45,
            sell_price=38,
            base_price=45
        ),
        ResourceType.TOOLS: MarketPrice(
            resource_type=ResourceType.TOOLS,
            buy_price=80,
            sell_price=65,
            base_price=80
        ),
    }
    
    class Config:
        use_enum_values = True
    
    last_update: datetime = datetime.now()
    
    def update_prices(self):
        for resource_type, price in self.prices.items():
            change = random.uniform(-price.volatility, price.volatility)
            new_base = price.base_price * (1 + change)
            new_base = max(price.base_price * 0.5, min(price.base_price * 1.5, new_base))
            
            price.base_price = round(new_base)
            price.buy_price = round(new_base * 1.2)
            price.sell_price = round(new_base * 0.8)
            
        self.last_update = datetime.now()