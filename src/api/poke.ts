import { api } from './index';

export interface PokeResponse {
  success: boolean;
  message: string;
  pointsEarned: number;
  cooldown?: number;
}

export interface User {
  id: string;
  username: string;
  points: number;
  pokesSent: number;
  pokesReceived: number;
  streak: number;
  rank: number;
  isOnline: boolean;
}

export const pokeApi = {
  // Send a poke to another user
  sendPoke: (userId: string) => 
    api.post<PokeResponse>(`/users/${userId}/poke`),
  
  // Get list of users you can poke
  getAvailableUsers: (search?: string) => 
    api.get<{ users: User[] }>('/users/available', { params: { search } }),
  
  // Get poke history
  getPokeHistory: () => 
    api.get<{ pokes: any[] }>('/users/me/pokes'),
  
  // Get user details
  getUser: (userId: string) => 
    api.get<User>(`/users/${userId}`),
};
