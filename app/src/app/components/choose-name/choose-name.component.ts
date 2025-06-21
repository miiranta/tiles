import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlayerService } from '../../services/player.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-choose-name',
  imports: [FormsModule],
  templateUrl: './choose-name.component.html',
  styleUrl: './choose-name.component.scss'
})
export class ChooseNameComponent {
  name: string = '';

  constructor(
    private router: Router, 
    private playerService: PlayerService,
    private loadingService: LoadingService
  ) {}

  openGame() {
    if (this.name.trim() && !this.loadingService.isLoading()) {
      this.playerService.setPlayerName(this.name);
      
      this.loadingService.show('Entrando no jogo...');
      setTimeout(() => {
        this.router.navigate(['/tiles']);
      }, 1500);
    }
  }

  get isLoading(): boolean {
    return this.loadingService.isLoading();
  }
}
