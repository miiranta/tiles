import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const BASE_URL = `http://${environment.BASE_URL}:${environment.PORT}`;

@Injectable({
  providedIn: 'root'
})
export class ApiPlayerService {

  constructor() {
    this.socket = io(BASE_URL);
  }

  // WebSocket
  private socket: Socket;

  emit(event: string, data: any) {
    this.socket.emit(event, data);
  }

  on(event: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on(event, (data) => {
        observer.next(data);
      });

      // Handle cleanup
      return () => {
        this.socket.off(event);
      };
    });
  }  

  async checkPlayerNameAvailability(playerName: string): Promise<any> {
    return await fetch(`${BASE_URL}/player/${encodeURIComponent(playerName)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
  }

  async createPlayerWithPassword(playerName: string, password: string): Promise<any> {
    return await fetch(`${BASE_URL}/player`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        playerName,
        password
      })
    });
  }

  async authenticatePlayer(playerName: string, password: string): Promise<any> {
    return await fetch(`${BASE_URL}/player/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        playerName,
        password
      })
    });
  }

  sendPlayerUpdate(token: string, x: number, y: number) {
    this.socket.emit('player-update', { token, x, y });
  }
  
  sendMapPlace(token: string, x: number, y: number, type: string) {
    this.socket.emit('map-place', { token, x, y, type });
  }

}
