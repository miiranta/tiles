import { Component, inject, Input, ViewChild, Output, EventEmitter, OnDestroy } from '@angular/core';

import { ApiFetchService } from '../../../../services/api-fetch.service';
import { COLORS } from '../../enums/colors.model';
import { PLACE_TILE_TIMEOUT } from '../../constants/game-config.consts';
import { Game } from '../../classes/game.class';

@Component({
  selector: 'app-game-canvas',
  imports: [],
  templateUrl: './game-canvas.component.html',
  styleUrl: './game-canvas.component.scss'
})
export class GameCanvasComponent implements OnDestroy {
  @ViewChild('gameCanvas') gameCanvas: any;
  @Input() playerId: string = "";
  @Input() selectedColor: string = COLORS[0];
  @Output() coordsChanged = new EventEmitter<any>();
  @Output() fpsChanged = new EventEmitter<number>();

  api: ApiFetchService = inject(ApiFetchService);

  coords: any = { x: 0, y: 0 };
  fps: number = 0;
  game?: Game = undefined;
  placeTileTimeout: any = null;
  statsInterval: any = null;
  
  ngAfterViewInit() {
    this.game = new Game(this.gameCanvas, this.api, this.playerId);

    this.canvasSetSize();
    window.addEventListener('resize', this.canvasSetSize.bind(this));

    this.statsInterval = setInterval(() => {
        this.coords = this.game?.player.getPosition();
        this.fps = Math.round(this.game?.drawManager.fps ?? 0);
        this.coordsChanged.emit(this.coords);
        this.fpsChanged.emit(this.fps);
      }, 1000 / 10);
  }

  ngOnDestroy() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }
    if (this.placeTileTimeout) {
      clearInterval(this.placeTileTimeout);
    }
    window.removeEventListener('resize', this.canvasSetSize.bind(this));
  }
  
  canvasSetSize() {
    if (this.gameCanvas) {
      this.gameCanvas.nativeElement.width = window.innerWidth;
      this.gameCanvas.nativeElement.height = window.innerHeight;
    }
  }

  private placeTile() {
    const x = this.coords.x;
    const y = this.coords.y;

    if (this.selectedColor) {
      this.game?.map.placeTile(x, y, this.selectedColor);
    }
  }

  placeTileBegin() {
    if (this.placeTileTimeout) this.placeTileEnd();
    this.placeTile();
    this.placeTileTimeout = setInterval(() => {
      this.placeTile();
    }, PLACE_TILE_TIMEOUT);
  }

  placeTileEnd() {
    if (this.placeTileTimeout) {
      clearInterval(this.placeTileTimeout);
      this.placeTileTimeout = null;
    }
  }
}
