@app.websocket("/ws/{player_id}")
async def websocket_endpoint(websocket: WebSocket, player_id: str):
    await websocket.accept()
    active_connections[player_id] = websocket
    print(f"✅ WebSocket подключен: {player_id}")
    
    try:
        while True:
            if player_id not in players:
                print(f"❌ Игрок {player_id} не найден")
                await websocket.send_json({"type": "error", "message": "Игрок не найден"})
                break
            
            player = players[player_id]
            
            try:
                # Упрощаем данные для отправки
                player_data = {
                    "id": player.id,
                    "name": player.name,
                    "gold": player.gold,
                    "level": player.level,
                    "experience": player.experience,
                    "max_workers": player.max_workers,
                    "total_salary_expense": player.total_salary_expense,
                    "storage": {
                        "resources": {}
                    },
                    "workers": [],
                    "buildings": []
                }
                
                # Ресурсы
                for res_type, amount in player.storage.resources.items():
                    player_data["storage"]["resources"][res_type.value if hasattr(res_type, 'value') else str(res_type)] = amount
                
                # Рабочие
                for worker in player.workers:
                    worker_data = {
                        "id": worker.id,
                        "type": worker.type.value if hasattr(worker.type, 'value') else str(worker.type),
                        "name": worker.name,
                        "level": worker.level,
                        "salary": worker.salary,
                        "is_paid": worker.is_paid,
                        "assigned_to": worker.assigned_to
                    }
                    player_data["workers"].append(worker_data)
                
                # Здания
                for building in player.buildings:
                    building_data = {
                        "type": building.type.value if hasattr(building.type, 'value') else str(building.type),
                        "level": building.level,
                        "worker_slots": building.worker_slots,
                        "current_workers": building.current_workers,
                        "efficiency": building.efficiency,
                        "bonus_percent": building.bonus_percent,
                        "maintenance": building.maintenance
                    }
                    player_data["buildings"].append(building_data)
                
                # Рынок
                market_data = {}
                for resource_type, price in market_service.market.prices.items():
                    key = resource_type.value if hasattr(resource_type, 'value') else str(resource_type)
                    market_data[key] = {
                        "buy_price": price.buy_price,
                        "sell_price": price.sell_price
                    }
                
                game_state = {
                    "type": "game_update",
                    "player": player_data,
                    "market": market_data,
                }
                
                await websocket.send_json(game_state)
                
            except Exception as e:
                print(f"❌ Ошибка формирования данных: {e}")
                import traceback
                traceback.print_exc()
                # Отправляем хоть что-то
                await websocket.send_json({"type": "ping", "gold": player.gold})
            
            await asyncio.sleep(1)
            
    except WebSocketDisconnect:
        print(f"🔌 Игрок {player_id} отключился")
    except Exception as e:
        print(f"❌ Критическая ошибка WebSocket: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if player_id in active_connections:
            del active_connections[player_id]