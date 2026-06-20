export enum ResourceType {
  WOOD = "wood",
  STONE = "stone",
  IRON = "iron",
  PLANKS = "planks",
  BRICKS = "bricks",
  TOOLS = "tools"
}

export enum WorkerType {
  LUMBERJACK = "lumberjack",
  MINER_STONE = "miner_stone",
  MINER_IRON = "miner_iron",
  CARPENTER = "carpenter",
  MASON = "mason",
  BLACKSMITH = "blacksmith"
}

export enum BuildingType {
  LUMBER_MILL = "lumber_mill",
  STONEMASON = "stonemason",
  SMITHY = "smithy",
  WAREHOUSE = "warehouse",
  MARKETPLACE = "marketplace"
}

export interface Worker {
  id: number;
  type: WorkerType;
  name: string;
  level: number;
  efficiency: number;
  salary: number;
  is_paid: boolean;
  assigned_to: string;
}

export interface Building {
  type: BuildingType;
  level: number;
  worker_slots: number;
  current_workers: number;
  efficiency: number;
  build_cost_gold: number;
  build_cost_resources: Record<string, number>;
  upgrade_cost_gold: number;
  upgrade_cost_resources: Record<string, number>;
  bonus_percent: number;
  maintenance: number;
}

export interface Player {
  id: string;
  name: string;
  gold: number;
  storage: {
    resources: Record<ResourceType, number>;
  };
  workers: Worker[];
  buildings: Building[];
  max_workers: number;
  level: number;
  experience: number;
  total_salary_expense: number;
}

export interface MarketPrices {
  [key: string]: {
    buy_price: number;
    sell_price: number;
    base_price: number;
  };
}

export interface GameState {
  player: Player;
  market: MarketPrices;
}

export interface BuildingInfo {
  name: string;
  description: string;
  build_cost_gold: number;
  build_cost_resources: Record<string, number>;
  maintenance: number;
  worker_slots: number;
  bonus_percent: number;
}