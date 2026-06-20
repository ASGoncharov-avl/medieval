from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import Dict
import asyncio

from models.player import Player, WorkerType
from models.resources import ResourceType, BuildingType
from services.market_service import MarketService
from services.production_service import ProductionService
from services.building_service import BuildingService

market_service = MarketService()
production_service = ProductionService()
building_service = BuildingService()

players: Dict[str, Player] = {}
active_connections: Dict[str, WebSocket] = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(market_service.update_prices_periodically())
    yield
    task.cancel()

app = FastAPI(title="Medieval Trader", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Medieval Trader API is running"}

@app.post("/api/player/create")
async def create_player(name: str):
    player_id = f"player_{len(players) + 1}"
    player = Player(id=player_id, name=name)
    players[player_id] = player
    return {"player_id": player_id, "player": player.model_dump()}

@app.get("/api/player/{player_id}")
async def get_player(player_id: str):
    if player_id not in players:
        return {"error": "Игрок не найден"}
    return players[player_id].model_dump()

@app.get("/api/market/prices")
async def get_market_prices():
    prices = {}
    for resource_type, price in market_service.market.prices.items():
        prices[resource_type.value] = {
            "buy_price": price.buy_price,
            "sell_price": price.sell_price,
            "base_price": price.base_price
        }
    return prices

@app.post("/api/market/buy")
async def buy_resource(player_id: str, resource_type: ResourceType, amount: int):
    if player_id not in players:
        return {"error": "Игрок не найден"}
    
    player = players[player_id]
    success, cost, message = market_service.buy_resource(resource_type, amount, player.gold)
    
    if success:
        player.gold -= cost
        player.storage.add_resource(resource_type, amount)
    
    return {"success": success, "message": message, "player": player.model_dump()}

@app.post("/api/market/sell")
async def sell_resource(player_id: str, resource_type: ResourceType, amount: int):
    if player_id not in players:
        return {"error": "Игрок не найден"}
    
    player = players[player_id]
    
    if not player.storage.remove_resource(resource_type, amount):
        return {"success": False, "message": "Недостаточно ресурсов!"}
    
    income, message = market_service.sell_resource(resource_type, amount, player)
    player.gold += income
    
    return {"success": True, "message": message, "player": player.model_dump()}

@app.post("/api/worker/hire")
async def hire_worker(player_id: str, worker_type: WorkerType):
    if player_id not in players:
        return {"error": "Игрок не найден"}
    
    player = players[player_id]
    can_hire, message = production_service.can_hire_worker(player, worker_type)
    
    if not can_hire:
        return {"success": False, "message": message}
    
    worker = production_service.hire_worker(player, worker_type)
    
    if player_id not in production_service.active_production:
        task = asyncio.create_task(production_service.produce_resources(player))
        production_service.active_production[player_id] = task
    
    return {"success": True, "message": f"Нанят {worker_type.value}", "player": player.model_dump()}

@app.get("/api/buildings/info")
async def get_buildings_info():
    """Информация о всех зданиях"""
    info = {}
    for building_type in BuildingType:
        info[building_type.value] = building_service.get_building_info(building_type)
    return info

@app.post("/api/building/build")
async def build_building(player_id: str, building_type: BuildingType):
    """Построить здание"""
    if player_id not in players:
        return {"error": "Игрок не найден"}
    
    player = players[player_id]
    can_build, message = building_service.can_build(player, building_type)
    
    if not can_build:
        return {"success": False, "message": message}
    
    building = building_service.build(player, building_type)
    return {"success": True, "message": f"Построено: {building_type.value}", "player": player.model_dump()}

@app.post("/api/building/hire")
async def hire_building_worker(player_id: str, building_type: BuildingType):
    """Нанять рабочего в здание"""
    if player_id not in players:
        return {"error": "Игрок не найден"}
    
    player = players[player_id]
    can_hire, message = building_service.can_hire_building_worker(player, building_type)
    
    if not can_hire:
        return {"success": False, "message": message}
    
    worker = building_service.hire_building_worker(player, building_type)
    
    if player_id not in production_service.active_production:
        task = asyncio.create_task(production_service.produce_resources(player))
        production_service.active_production[player_id] = task
    
    return {"success": True, "message": f"Нанят рабочий в {building_type.value}", "player": player.model_dump()}

@app.websocket("/ws/{player_id}")
async def websocket_endpoint(websocket: WebSocket, player_id: str):
    await websocket.accept()
    active_connections[player_id] = websocket
    
    try:
        while True:
            if player_id in players:
                player = players[player_id]
                
                game_state = {
                    "type": "game_update",
                    "player": player.model_dump(),
                    "market": {},
                }
                
                for resource_type, price in market_service.market.prices.items():
                    game_state["market"][resource_type.value] = {
                        "buy_price": price.buy_price,
                        "sell_price": price.sell_price
                    }
                
                await websocket.send_json(game_state)
            
            await asyncio.sleep(1)
            
    except WebSocketDisconnect:
        if player_id in active_connections:
            del active_connections[player_id]
    except Exception as e:
        if player_id in active_connections:
            del active_connections[player_id]

@app.get("/api/price_history/{resource_type}")
async def get_price_history(resource_type: ResourceType):
    return market_service.price_history.get(resource_type, [])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)