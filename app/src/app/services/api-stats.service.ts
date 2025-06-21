import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { PlayerStats } from '../components/tiles/interfaces/player-stats.interface';

@Injectable({
  providedIn: 'root',
})
export class ApiStatsService {
  private readonly baseUrl = environment.apiUrl;

  constructor() {}

  async getPlayerStats(playerName: string): Promise<PlayerStats> {
    const response = await fetch(`${this.baseUrl}/stats/${playerName}`);
    if (!response.ok) {
      throw new Error(
        `Erro ao buscar estatísticas do jogador: ${response.statusText}`
      );
    }
    const data: PlayerStats = await response.json();
    return data;
  }
}
