import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
    private playerName = '';

    constructor() { }

    setPlayerName(name: string): void {
        this.playerName = name;
    }

    getPlayerName(): string {
        return this.playerName || '';
    }

    clearPlayerName(): void {
        this.playerName = '';
    }
}
