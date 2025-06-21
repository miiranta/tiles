import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

const BASE_URL = `http://${environment.BASE_URL}:${environment.PORT}`;

@Injectable({
  providedIn: 'root'
})
export class ApiMapService {

  constructor() { }

  // REST API methods for map operations
  async getMapTiles(x: number, y: number, render: number){
    return await fetch(`${BASE_URL}/map/${x}/${y}/${render}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
  }
  async putMapTile(x: number, y: number, type: string){
    return await fetch(`${BASE_URL}/map/${x}/${y}/${type}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    })
  }
}
