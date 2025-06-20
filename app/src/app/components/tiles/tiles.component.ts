import { Component, inject, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiFetchService } from '../../services/api-fetch.service';
import { COLORS } from './enums/colors.model';
import { PLACE_TILE_TIMEOUT } from './constants/game-config.consts';
import { Game } from './classes/game.class';

@Component({
  selector: 'tiles',
  imports: [CommonModule],
  templateUrl: './tiles.component.html',
  styleUrl: './tiles.component.scss'
})
export class TilesComponent {
  @ViewChild('tiles') tiles: any;
  @Input() playerId: string = "";

  api: ApiFetchService = inject(ApiFetchService);

  coords: any = { x: 0, y: 0 };
  fps: number = 0;
  colors: string[] = COLORS;
  selected_color: string = COLORS[0];
  game?: Game = undefined;
  placeTileTimeout: any = null;
  
  ngAfterViewInit() {
    this.game = new Game(this.tiles, this.api, this.playerId);

    this.canvasSetSize();
    window.addEventListener('resize', this.canvasSetSize.bind(this));

    setInterval(() => {
        this.coords = this.game?.player.getPosition();
        this.fps = Math.round(this.game?.drawManager.fps ?? 0);
      }, 1000 / 10);
  }
  
  canvasSetSize() {
    if (this.tiles) {
      this.tiles.nativeElement.width = window.innerWidth;
      this.tiles.nativeElement.height = window.innerHeight;
    }
  }

  selectColor(color: string) {
    this.selected_color = color;
  }

  private placeTile() {
    const x = this.coords.x;
    const y = this.coords.y;

    if (this.selected_color) {
      this.game?.map.placeTile(x, y, this.selected_color);
    }
  }

  placeTileBegin() {
    if (this.placeTileTimeout) this.placeTileEnd();
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
