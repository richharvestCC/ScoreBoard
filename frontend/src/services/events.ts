import axios from 'axios';

export interface CreateEventPayload {
  matchId: string;
  teamId: string;
  playerId: string;
  assistPlayerId?: string | null;
  eventType: string;
  minute: number;
  description?: string;
  coordinates: {
    x: number;
    y: number;
    zone: string;
  };
  period: number;
}

export interface CreateEventResponse {
  id: string;
}

const eventsClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE ?? '/api/v1',
});

export async function createEvent(payload: CreateEventPayload) {
  const response = await eventsClient.post<CreateEventResponse>('/events', payload);
  return response.data;
}
