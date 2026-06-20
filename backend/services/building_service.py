from models.player import Player, WorkerType, Worker
from models.resources import BuildingType, Building, ResourceType
from typing import Dict

class BuildingService:
    
    # Конфигурация всех зданий
    BUILDING_CONFIGS = {
        BuildingType.LUMBER_MILL: {
            "name": "Лесопилка",
            "description": "Производит доски из дерева",
            "worker_type": WorkerType.CARPENTER,
            "build_cost_gold": 500,
            "build_cost_resources": {ResourceType.WOOD: 100},
            "upgrade_cost_gold": 1000,
            "upgrade_cost_resources": {ResourceType.WOOD: 200},
            "worker_slots": 1,
            "maintenance": 5,
            "input_resource": ResourceType.WOOD,
            "input_amount": 2,
            "output_resource": ResourceType.PLANKS,
            "output_amount": 1,
            "worker_salary": 6,
        },
        BuildingType.STONEMASON: {
            "name": "Каменоломня",
            "description": "Производит кирпичи из камня",
            "worker_type": WorkerType.MASON,
            "build_cost_gold": 500,
            "build_cost_resources": {ResourceType.STONE: 100},
            "upgrade_cost_gold": 1000,
            "upgrade_cost_resources": {ResourceType.STONE: 200},
            "worker_slots": 1,
            "maintenance": 5,
            "input_resource": ResourceType.STONE,
            "input_amount": 2,
            "output_resource": ResourceType.BRICKS,
            "output_amount": 1,
            "worker_salary": 6,
        },
        BuildingType.SMITHY: {
            "name": "Кузница",
            "description": "Производит инструменты из железа",
            "worker_type": WorkerType.BLACKSMITH,
            "build_cost_gold": 1000,
            "build_cost_resources": {ResourceType.BRICKS: 100, ResourceType.PLANKS: 100},
            "upgrade_cost_gold": 2000,
            "upgrade_cost_resources": {ResourceType.BRICKS: 200, ResourceType.PLANKS: 200},
            "worker_slots": 1,
            "maintenance": 8,
            "input_resource": ResourceType.IRON,
            "input_amount": 2,
            "output_resource": ResourceType.TOOLS,
            "output_amount": 1,
            "worker_salary": 10,
        },
        BuildingType.WAREHOUSE: {
            "name": "Склад",
            "description": "Увеличивает лимит хранения +200",
            "worker_type": None,  # пассивное здание
            "build_cost_gold": 800,
            "build_cost_resources": {ResourceType.PLANKS: 150, ResourceType.STONE: 150},
            "upgrade_cost_gold": 1500,
            "upgrade_cost_resources": {ResourceType.PLANKS: 300, ResourceType.STONE: 300},
            "worker_slots": 0,
            "maintenance": 3,
            "bonus_percent": 200,  # +200 к лимиту
        },
        BuildingType.MARKETPLACE: {
            "name": "Рынок",
            "description": "+10% к ценам продажи",
            "worker_type": None,
            "build_cost_gold": 2000,
            "build_cost_resources": {ResourceType.PLANKS: 200, ResourceType.BRICKS: 200},
            "upgrade_cost_gold": 4000,
            "upgrade_cost_resources": {ResourceType.PLANKS: 400, ResourceType.BRICKS: 400},
            "worker_slots": 0,
            "maintenance": 5,
            "bonus_percent": 10,  # +10% к продаже
        },
    }
    
    def get_building_info(self, building_type: BuildingType) -> dict:
        return self.BUILDING_CONFIGS.get(building_type, {})
    
    def can_build(self, player: Player, building_type: BuildingType) -> tuple:
        """Проверка возможности постройки"""
        config = self.BUILDING_CONFIGS[building_type]
        
        # Проверяем, не построено ли уже
        for b in player.buildings:
            if b.type == building_type:
                return False, f"{config['name']} уже построена!"
        
        # Проверяем золото
        if player.gold < config["build_cost_gold"]:
            return False, f"Недостаточно золота! Нужно {config['build_cost_gold']}"
        
        # Проверяем ресурсы
        for res_type, amount in config["build_cost_resources"].items():
            if player.storage.resources[res_type] < amount:
                return False, f"Недостаточно {res_type.value}! Нужно {amount}"
        
        return True, f"Можно построить {config['name']}"
    
    def build(self, player: Player, building_type: BuildingType) -> Building:
        """Постройка здания"""
        config = self.BUILDING_CONFIGS[building_type]
        
        # Списываем стоимость
        player.gold -= config["build_cost_gold"]
        for res_type, amount in config["build_cost_resources"].items():
            player.storage.remove_resource(res_type, amount)
        
        # Создаем здание
        building = Building(
            type=building_type,
            level=1,
            worker_slots=config["worker_slots"],
            current_workers=0,
            efficiency=1.0,
            build_cost_gold=config["build_cost_gold"],
            build_cost_resources=config["build_cost_resources"],
            upgrade_cost_gold=config["upgrade_cost_gold"],
            upgrade_cost_resources=config["upgrade_cost_resources"],
            bonus_percent=config.get("bonus_percent", 0),
            maintenance=config["maintenance"],
        )
        
        player.buildings.append(building)
        return building
    
    def can_hire_building_worker(self, player: Player, building_type: BuildingType) -> tuple:
        """Проверка найма рабочего в здание"""
        config = self.BUILDING_CONFIGS[building_type]
        
        if config["worker_type"] is None:
            return False, "В это здание не требуются рабочие"
        
        # Находим здание
        building = None
        for b in player.buildings:
            if b.type == building_type:
                building = b
                break
        
        if not building:
            return False, f"Сначала постройте {config['name']}!"
        
        if building.current_workers >= building.worker_slots * building.level:
            return False, "Все слоты для рабочих заняты!"
        
        if len(player.workers) >= player.max_workers:
            return False, "Достигнут максимум рабочих!"
        
        return True, "Можно нанять"
    
    def hire_building_worker(self, player: Player, building_type: BuildingType) -> Worker:
        """Найм рабочего в здание"""
        config = self.BUILDING_CONFIGS[building_type]
        
        # Находим здание
        building = None
        for b in player.buildings:
            if b.type == building_type:
                building = b
                break
        
        worker = Worker(
            id=len(player.workers) + 1,
            type=config["worker_type"],
            name=f"{config['worker_type'].value}_{len(player.workers) + 1}",
        )
        worker.salary = config["worker_salary"]
        worker.assigned_to = building_type.value
        
        player.workers.append(worker)
        building.current_workers += 1
        
        return worker
    
    def get_production_bonus(self, player: Player) -> float:
        """Бонус от рынка к продаже"""
        bonus = 1.0
        for b in player.buildings:
            if b.type == BuildingType.MARKETPLACE:
                bonus += b.bonus_percent * b.level / 100
        return bonus
    
    def get_storage_bonus(self, player: Player) -> int:
        """Бонус от склада"""
        bonus = 0
        for b in player.buildings:
            if b.type == BuildingType.WAREHOUSE:
                bonus += int(b.bonus_percent * b.level)
        return bonus