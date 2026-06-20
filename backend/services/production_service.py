from models.player import Player, Worker, WorkerType
from models.resources import ResourceType
import asyncio
from typing import Dict

class ProductionService:
    def __init__(self):
        self.active_production: Dict[str, asyncio.Task] = {}
    
    def get_worker_cost(self, worker_type: WorkerType) -> Dict:
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
    
    def can_hire_worker(self, player: Player, worker_type: WorkerType) -> tuple:
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
        
        # Проверяем, сможем ли платить зарплату
        worker_temp = Worker(id=0, type=worker_type, name="temp")
        total_salary = sum(w.get_salary() for w in player.workers) + worker_temp.get_salary()
        if player.gold - cost["gold"] < total_salary * 2:  # предупреждение если золота мало
            return True, "⚠️ Учтите, что рабочим нужно платить зарплату!"
        
        return True, "Можно нанять"
    
    def hire_worker(self, player: Player, worker_type: WorkerType) -> Worker:
        """Найм рабочего"""
        cost = self.get_worker_cost(worker_type)
        
        player.gold -= cost["gold"]
        if "resources" in cost:
            for resource_type, amount in cost["resources"].items():
                player.storage.remove_resource(resource_type, amount)
        
        worker = Worker(
            id=len(player.workers) + 1,
            type=worker_type,
            name=f"{worker_type.value}_{len(player.workers) + 1}"
        )
        # Устанавливаем зарплату
        worker.salary = worker.get_salary()
        
        player.workers.append(worker)
        return worker
    
    def pay_salaries(self, player: Player) -> tuple:
        """Выплата зарплаты всем рабочим. Возвращает (успех, сообщение)"""
        total_salary = 0
        unpaid_workers = []
        
        for worker in player.workers:
            salary = worker.get_salary()
            total_salary += salary
            
            if player.gold >= salary:
                player.gold -= salary
                player.total_salary_expense += salary
                worker.is_paid = True
            else:
                worker.is_paid = False
                unpaid_workers.append(worker.name)
        
        if unpaid_workers:
            return False, f"Не хватило золота на зарплату! {', '.join(unpaid_workers)} не вышли на работу"
        return True, f"Выплачена зарплата: {total_salary} 💰"
    
    async def produce_resources(self, player: Player):
        """Автоматическая добыча ресурсов рабочими"""
        cycle_count = 0
        while True:
            cycle_count += 1
            
            # Каждые 12 циклов (60 секунд) платим зарплату
            if cycle_count % 12 == 0:
                self.pay_salaries(player)
            
            for worker in player.workers:
                if not worker.is_paid:
                    continue  # без зарплаты не работают
                
                production_rate = worker.get_production_rate()
                
                if worker.type == WorkerType.LUMBERJACK:
                    player.storage.add_resource(ResourceType.WOOD, production_rate)
                    
                elif worker.type == WorkerType.MINER_STONE:
                    player.storage.add_resource(ResourceType.STONE, production_rate)
                    
                elif worker.type == WorkerType.MINER_METAL:
                    player.storage.add_resource(ResourceType.METAL, production_rate)
                    
                elif worker.type == WorkerType.CARPENTER:
                    if player.storage.remove_resource(ResourceType.WOOD, 2):
                        player.storage.add_resource(ResourceType.PLANKS, production_rate)
                        
                elif worker.type == WorkerType.MASON:
                    if player.storage.remove_resource(ResourceType.STONE, 2):
                        player.storage.add_resource(ResourceType.BRICKS, production_rate)
                        
                elif worker.type == WorkerType.BLACKSMITH:
                    if player.storage.remove_resource(ResourceType.METAL, 2):
                        player.storage.add_resource(ResourceType.TOOLS, production_rate)
                
                player.experience += production_rate
                
                if player.experience >= player.level * 100:
                    player.level += 1
                    player.max_workers += 1
            
            await asyncio.sleep(5)  # цикл каждые 5 секунд