import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const api = {
  createPlayer: async (name: string) => {
    const response = await axios.post(`${API_URL}/api/player/create?name=${name}`);
    return response.data;
  },

  getPlayer: async (playerId: string) => {
    const response = await axios.get(`${API_URL}/api/player/${playerId}`);
    return response.data;
  },

  getMarketPrices: async () => {
    const response = await axios.get(`${API_URL}/api/market/prices`);
    return response.data;
  },

  buyResource: async (playerId: string, resourceType: string, amount: number) => {
    const response = await axios.post(
      `${API_URL}/api/market/buy?player_id=${playerId}&resource_type=${resourceType}&amount=${amount}`
    );
    return response.data;
  },

  sellResource: async (playerId: string, resourceType: string, amount: number) => {
    const response = await axios.post(
      `${API_URL}/api/market/sell?player_id=${playerId}&resource_type=${resourceType}&amount=${amount}`
    );
    return response.data;
  },

  hireWorker: async (playerId: string, workerType: string) => {
    const response = await axios.post(
      `${API_URL}/api/worker/hire?player_id=${playerId}&worker_type=${workerType}`
    );
    return response.data;
  }
};