import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

const BASE_URL = window.location.origin.replace(/:\d+$/, ':3000');

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

  sendPlayerPosition(playerName: string, x: number, y: number) {
    this.socket.emit('playerPosition', { playerName, x, y });
  }
}
