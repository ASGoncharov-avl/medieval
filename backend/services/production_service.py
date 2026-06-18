from models.player import Player, Worker, WorkerType
from models.resources import ResourceType
import asyncio
from typing import Dict, List

class ProductionService:
    def __init__(self):
        self.active_production: Dict[str, asyncio.Task] = {}
    
    def get_worker_cost(self, worker_type: WorkerType) -> Dict[str, int]:
        """Стоимость найма рабочего"""
        costs = {
            WorkerType.LUMBERJACK: {"gold": 50},
            WorkerType.MINER_STONE: {"gold": 75},
            WorkerType.MINER_METAL: {"gold": 100},
            WorkerType.CARPENTER: {"gold": 80, "resources": {ResourceType.WOOD: 20}},
            WorkerType.MASON: {"gold": 80, "resources": {ResourceType.STONE: 20}},
            WorkerType.BLACKSMITH: {"gold": 120, "resources": {ResourceType.METAL: 10}},
        }
        return costs[worker_type]
    
    def can_hire_worker(self, player: Player, worker_type: WorkerType) -> tuple[bool, str]:
        """Проверка возможности найма рабочего"""
        if len(player.workers) >= player.max_workers:
            return False, "Достигнут максимум рабочих!"
        
        cost = self.get_worker_cost(worker_type)
        
        if player.gold < cost["gold"]:
            return False, f"Недостаточно золота! Нужно {cost['gold']}, у вас {player.gold}"
        
        if "resources" in cost:
            for resource_type, amount in cost["resources"].items():
                if player.storage.resources[resource_type] < amount:
                    return False, f"Недостаточно {resource_type.value}! Нужно {amount}"
        
        return True, "Можно нанять"
    
    def hire_worker(self, player: Player, worker_type: WorkerType) -> Worker:
        """Найм рабочего"""
        cost = self.get_worker_cost(worker_type)
        
        # Списание стоимости
        player.gold -= cost["gold"]
        if "resources" in cost:
            for resource_type, amount in cost["resources"].items():
                player.storage.remove_resource(resource_type, amount)
        
        # Создание рабочего
        worker = Worker(
            id=len(player.workers) + 1,
            type=worker_type,
            name=f"{worker_type.value}_{len(player.workers) + 1}"
        )
        
        player.workers.append(worker)
        return worker
    
    async def produce_resources(self, player: Player):
        """Автоматическая добыча ресурсов рабочими"""
        while True:
            for worker in player.workers:
                production_rate = worker.get_production_rate()
                
                if worker.type == WorkerType.LUMBERJACK:
                    player.storage.add_resource(ResourceType.WOOD, production_rate)
                    
                elif worker.type == WorkerType.MINER_STONE:
                    player.storage.add_resource(ResourceType.STONE, production_rate)
                    
                elif worker.type == WorkerType.MINER_METAL:
                    player.storage.add_resource(ResourceType.METAL, production_rate)
                    
                elif worker.type == WorkerType.CARPENTER:
                    # Переработка дерева в доски
                    if player.storage.remove_resource(ResourceType.WOOD, 2):
                        player.storage.add_resource(ResourceType.PLANKS, production_rate)
                        
                elif worker.type == WorkerType.MASON:
                    # Переработка камня в кирпичи
                    if player.storage.remove_resource(ResourceType.STONE, 2):
                        player.storage.add_resource(ResourceType.BRICKS, production_rate)
                        
                elif worker.type == WorkerType.BLACKSMITH:
                    # Переработка металла в инструменты
                    if player.storage.remove_resource(ResourceType.METAL, 2):
                        player.storage.add_resource(ResourceType.TOOLS, production_rate)
                
                # Начисление опыта
                player.experience += production_rate
                
                # Повышение уровня
                if player.experience >= player.level * 100:
                    player.level += 1
                    player.max_workers += 1
            
            await asyncio.sleep(5)  # добыча каждые 5 секунд