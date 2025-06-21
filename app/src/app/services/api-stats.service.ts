import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface PlayerStats {
  playerName: string;
  distanceTraveled: number;
  tilesPlaced: { [tileType: string]: number };
  createdAt: string;
  lastLogin: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiStatsService {
  private readonly baseUrl = environment.apiUrl;

  constructor() { }

  async getPlayerStats(playerName: string): Promise<PlayerStats> {
    const response = await fetch(`${this.baseUrl}/stats/${playerName}`);

    if (!response.ok) {
      throw new Error(`Error fetching player stats: ${response.statusText}`);
    }

    const data: PlayerStats = await response.json();
    return data;
  }
}

