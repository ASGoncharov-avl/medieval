from models.market import Market, MarketPrice
from models.resources import ResourceType
from services.building_service import BuildingService
import random
import asyncio
from datetime import datetime
from typing import Dict

class MarketService:
    def __init__(self):
        self.market = Market()
        self.building_service = BuildingService()
        self.price_history: Dict[ResourceType, list] = {
            resource_type: [] for resource_type in ResourceType
        }
    
    def get_market_prices(self):
        return self.market.prices
    
    def buy_resource(self, resource_type: ResourceType, amount: int, player_gold: int) -> tuple:
        """Покупка ресурса игроком"""
        price = self.market.prices[resource_type].buy_price
        total_cost = price * amount
        
        if player_gold >= total_cost:
            return True, total_cost, f"Куплено {amount} {resource_type.value} за {total_cost} золота"
        else:
            return False, 0, f"Недостаточно золота! Нужно {total_cost}, у вас {player_gold}"
    
    def sell_resource(self, resource_type: ResourceType, amount: int, player=None) -> tuple:
        """Продажа ресурса с учетом бонуса от рынка"""
        base_price = self.market.prices[resource_type].sell_price
        
        # Применяем бонус от рынка если есть игрок
        if player:
            bonus = self.building_service.get_production_bonus(player)
            price = int(base_price * bonus)
        else:
            price = base_price
        
        total_income = price * amount
        return total_income, f"Продано {amount} {resource_type.value} за {total_income} золота"
    
    async def update_prices_periodically(self):
        """Периодическое обновление цен"""
        while True:
            self.market.update_prices()
            
            for resource_type, price in self.market.prices.items():
                self.price_history[resource_type].append({
                    "time": datetime.now().isoformat(),
                    "price": price.base_price
                })
                if len(self.price_history[resource_type]) > 100:
                    self.price_history[resource_type].pop(0)
            
            await asyncio.sleep(30)