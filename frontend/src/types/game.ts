export enum ResourceType {
  WOOD = "wood",
  STONE = "stone",
  METAL = "metal",
  PLANKS = "planks",
  BRICKS = "bricks",
  TOOLS = "tools"
}

export enum WorkerType {
  LUMBERJACK = "lumberjack",
  MINER_STONE = "miner_stone",
  MINER_METAL = "miner_metal",
  CARPENTER = "carpenter",
  MASON = "mason",
  BLACKSMITH = "blacksmith"
}

export interface Worker {
  id: number;
  type: WorkerType;
  name: string;
  level: number;
  efficiency: number;
  cost_gold_per_day: number;
}

export interface Player {
  id: string;
  name: string;
  gold: number;
  storage: {
    resources: Record<ResourceType, number>;
  };
  workers: Worker[];
  max_workers: number;
  level: number;
  experience: number;
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