from models.market import Market
from models.resources import ResourceType
import random
import asyncio
from datetime import datetime
from typing import Dict

class MarketService:
    def __init__(self):
        self.market = Market()
        self.price_history: Dict[ResourceType, list] = {
            resource_type: [] for resource_type in ResourceType
        }
    
    def get_market_prices(self):
        return self.market.prices
    
    def buy_resource(self, resource_type: ResourceType, amount: int, player_gold: int) -> tuple[bool, int, str]:
        """Покупка ресурса игроком. Возвращает (успех, стоимость, сообщение)"""
        price = self.market.prices[resource_type].buy_price
        total_cost = price * amount
        
        if player_gold >= total_cost:
            return True, total_cost, f"Куплено {amount} {resource_type.value} за {total_cost} золота"
        else:
            return False, 0, f"Недостаточно золота! Нужно {total_cost}, у вас {player_gold}"
    
    def sell_resource(self, resource_type: ResourceType, amount: int) -> tuple[int, str]:
        """Продажа ресурса игроком. Возвращает (доход, сообщение)"""
        price = self.market.prices[resource_type].sell_price
        total_income = price * amount
        return total_income, f"Продано {amount} {resource_type.value} за {total_income} золота"
    
    async def update_prices_periodically(self):
        """Периодическое обновление цен (каждые 30 секунд)"""
        while True:
            self.market.update_prices()
            # Сохраняем историю цен
            for resource_type, price in self.market.prices.items():
                self.price_history[resource_type].append({
                    "time": datetime.now().isoformat(),
                    "price": price.base_price
                })
                # Храним только последние 100 записей
                if len(self.price_history[resource_type]) > 100:
                    self.price_history[resource_type].pop(0)
            
            await asyncio.sleep(30)  # обновление каждые 30 секунд