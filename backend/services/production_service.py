from models.player import Player, Worker, WorkerType
from models.resources import ResourceType, BuildingType
from services.building_service import BuildingService
import asyncio
from typing import Dict

class ProductionService:
    def __init__(self):
        self.active_production: Dict[str, asyncio.Task] = {}
        self.building_service = BuildingService()
    
    def get_worker_cost(self, worker_type: WorkerType) -> Dict:
        """Стоимость найма рабочего"""
        costs = {
            WorkerType.LUMBERJACK: {"gold": 50},
            WorkerType.MINER_STONE: {"gold": 75},
            WorkerType.MINER_IRON: {"gold": 100},
            WorkerType.CARPENTER: {"gold": 0},      # нанимается через лесопилку
            WorkerType.MASON: {"gold": 0},           # нанимается через каменоломню
            WorkerType.BLACKSMITH: {"gold": 0},      # нанимается через кузницу
        }
        return costs[worker_type]
    
    def can_hire_worker(self, player: Player, worker_type: WorkerType) -> tuple:
        """Проверка возможности найма рабочего"""
        if len(player.workers) >= player.max_workers:
            return False, "Достигнут максимум рабочих!"
        
        cost = self.get_worker_cost(worker_type)
        
        if player.gold < cost["gold"]:
            return False, f"Недостаточно золота! Нужно {cost['gold']}, у вас {player.gold}"
        
        return True, "Можно нанять"
    
    def hire_worker(self, player: Player, worker_type: WorkerType) -> Worker:
        """Найм рабочего"""
        cost = self.get_worker_cost(worker_type)
        player.gold -= cost["gold"]
        
        worker = Worker(
            id=len(player.workers) + 1,
            type=worker_type,
            name=f"{worker_type.value}_{len(player.workers) + 1}"
        )
        worker.salary = worker.get_salary()
        player.workers.append(worker)
        return worker
    
    def pay_salaries(self, player: Player) -> tuple:
        """Выплата зарплаты + обслуживание зданий"""
        total_cost = 0
        unpaid_workers = []
        
        # Зарплата рабочим
        for worker in player.workers:
            salary = worker.get_salary()
            total_cost += salary
            
            if player.gold >= salary:
                player.gold -= salary
                player.total_salary_expense += salary
                worker.is_paid = True
            else:
                worker.is_paid = False
                unpaid_workers.append(worker.name)
        
        # Обслуживание зданий
        for building in player.buildings:
            if player.gold >= building.maintenance:
                player.gold -= building.maintenance
                total_cost += building.maintenance
        
        if unpaid_workers:
            return False, f"Не хватило золота! {', '.join(unpaid_workers)} не работают"
        return True, f"Расходы: {total_cost} 💰"
    
    async def produce_resources(self, player: Player):
        """Добыча и производство ресурсов"""
        cycle_count = 0
        while True:
            cycle_count += 1
            
            # Каждые 12 циклов (60 секунд) платим зарплату
            if cycle_count % 12 == 0:
                self.pay_salaries(player)
            
            for worker in player.workers:
                if not worker.is_paid:
                    continue
                
                production_rate = worker.get_production_rate()
                
                # Базовая добыча (лесоруб, рудокопы)
                if worker.type == WorkerType.LUMBERJACK:
                    player.storage.add_resource(ResourceType.WOOD, production_rate)
                    
                elif worker.type == WorkerType.MINER_STONE:
                    player.storage.add_resource(ResourceType.STONE, production_rate)
                    
                elif worker.type == WorkerType.MINER_IRON:
                    player.storage.add_resource(ResourceType.IRON, production_rate)
                
                # Производство в зданиях
                elif worker.type == WorkerType.CARPENTER:
                    # Проверяем есть ли лесопилка
                    has_building = any(b.type == BuildingType.LUMBER_MILL for b in player.buildings)
                    if has_building:
                        config = self.building_service.BUILDING_CONFIGS[BuildingType.LUMBER_MILL]
                        if player.storage.remove_resource(ResourceType.WOOD, config["input_amount"]):
                            player.storage.add_resource(ResourceType.PLANKS, production_rate)
                
                elif worker.type == WorkerType.MASON:
                    has_building = any(b.type == BuildingType.STONEMASON for b in player.buildings)
                    if has_building:
                        config = self.building_service.BUILDING_CONFIGS[BuildingType.STONEMASON]
                        if player.storage.remove_resource(ResourceType.STONE, config["input_amount"]):
                            player.storage.add_resource(ResourceType.BRICKS, production_rate)
                
                elif worker.type == WorkerType.BLACKSMITH:
                    has_building = any(b.type == BuildingType.SMITHY for b in player.buildings)
                    if has_building:
                        config = self.building_service.BUILDING_CONFIGS[BuildingType.SMITHY]
                        if player.storage.remove_resource(ResourceType.IRON, config["input_amount"]):
                            player.storage.add_resource(ResourceType.TOOLS, production_rate)
                
                player.experience += production_rate
                
                if player.experience >= player.level * 100:
                    player.level += 1
                    player.max_workers += 1
            
            await asyncio.sleep(5)