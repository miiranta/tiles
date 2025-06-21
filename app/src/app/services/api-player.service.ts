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
  async createPlayer(playerName: string): Promise<any> {
    return await fetch(`${BASE_URL}/player`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        playerName,
        socketId: this.socket.id
      })
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

  sendPlayerUpdate(token: string, x: number, y: number) {
    this.socket.emit('player-update', { token, x, y });
  }

  sendTilePlaced(token: string, x: number, y: number, type: string) {
    this.socket.emit('tilePlaced', { token, x, y, type });
  }

}
