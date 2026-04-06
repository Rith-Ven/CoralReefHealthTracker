import type { Reef, ReefCreate, Observation, ObservationCreate, ObservationUpdate, Trend } from './types';

const API_BASE_URL = 'http://localhost:8081';

// Helper function to fetch with a timeout
async function fetchWithTimeout(resource: string, options: RequestInit & { timeout?: number } = {}) {
  const { timeout = 10000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out (server took too long to respond)');
    }
    throw error;
  }
}

export const api = {
  getReefs: async (skip = 0, limit = 100): Promise<Reef[]> => {
    console.log('API: GET /reefs/');
    const response = await fetchWithTimeout(`${API_BASE_URL}/reefs/?skip=${skip}&limit=${limit}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API ERROR (GET /reefs/):', response.status, errorText);
      throw new Error(`Failed to fetch reefs: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  createReef: async (reef: ReefCreate): Promise<Reef> => {
    console.log('API: POST /reefs/', reef);
    const response = await fetchWithTimeout(`${API_BASE_URL}/reefs/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reef),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API ERROR (POST /reefs/):', response.status, errorText);
      throw new Error(`Failed to create reef: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    console.log('API SUCCESS (POST /reefs/):', result);
    return result;
  },

  deleteReef: async (reefId: number): Promise<Reef> => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/reefs/${reefId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete reef');
    return response.json();
  },

  getObservations: async (params: {
    reef_id?: number;
    location?: string;
    start_date?: string;
    end_date?: string;
    skip?: number;
    limit?: number;
  } = {}): Promise<Observation[]> => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, value.toString());
    });
    const response = await fetchWithTimeout(`${API_BASE_URL}/observations/?${query.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch observations');
    return response.json();
  },

  createObservation: async (observation: ObservationCreate): Promise<Observation> => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/observations/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(observation),
    });
    if (!response.ok) throw new Error('Failed to create observation');
    return response.json();
  },

  updateObservation: async (observationId: number, observation: ObservationUpdate): Promise<Observation> => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/observations/${observationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(observation),
    });
    if (!response.ok) throw new Error('Failed to update observation');
    return response.json();
  },

  deleteObservation: async (observationId: number): Promise<Observation> => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/observations/${observationId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete observation');
    return response.json();
  },

  getReefTrends: async (reefId: number): Promise<Trend> => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/trends/${reefId}`);
    if (!response.ok) throw new Error('Failed to fetch trends');
    return response.json();
  },
};
