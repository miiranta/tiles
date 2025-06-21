import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const BASE_URL = `http://${environment.BASE_URL}:${environment.PORT}`;

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(BASE_URL);
  }

  emit(event: string, data: any) {
    this.socket.emit(event, data);
  }

  on(event: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on(event, (data) => {
        observer.next(data);
      });

      return () => {
        this.socket.off(event);
      };
    });
  }
}
