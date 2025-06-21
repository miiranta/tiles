import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

const BASE_URL = `http://${environment.BASE_URL}:${environment.PORT}`;

@Injectable({
  providedIn: 'root',
})
export class ApiMapService {
  constructor() {}

  async getMapTiles(x: number, y: number, range: number) {
    return await fetch(`${BASE_URL}/map/${x}/${y}/${range}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }
}
