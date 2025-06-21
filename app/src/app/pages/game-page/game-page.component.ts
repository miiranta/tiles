import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TilesComponent } from '../../components/tiles/tiles.component';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-game-page',
  imports: [TilesComponent],
  templateUrl: './game-page.component.html',
  styleUrl: './game-page.component.scss'
})
export class GamePageComponent implements OnInit {
  playerName: string = '';

  constructor(private playerService: PlayerService, private router: Router) {}

  ngOnInit() {
    this.playerName = this.playerService.getPlayerName();
    if (!this.playerName) {
      this.router.navigate(['/']);
    }
  }
}
