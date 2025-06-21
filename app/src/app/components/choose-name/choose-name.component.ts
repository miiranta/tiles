import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlayerService } from '../../services/player.service';
import { LoadingService } from '../../services/loading.service';
import { ApiPlayerService } from '../../services/api-player.service';
import { PopupService } from '../../services/popup.service';

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
    private loadingService: LoadingService,
    private apiPlayerService: ApiPlayerService,
    private popupService: PopupService
  ) {}

  async openGame() {
    if (this.name.trim() && !this.loadingService.isLoading()) {
      this.loadingService.show('Criando jogador...');
      
      try {
        const response = await this.apiPlayerService.createPlayer(this.name.trim());
        const data = await response.json();
        if (response.ok && data.success) {
          // Store player data
          this.playerService.setPlayerName(data.playerName);
          this.playerService.setJwtToken(data.token);
          
          this.loadingService.setMessage('Entrando no jogo...');
          setTimeout(() => {
            this.loadingService.hide();
            this.router.navigate(['/tiles']);
          }, 1000);
        } else {
          this.loadingService.hide();
          this.popupService.error(
            'Erro ao criar jogador', 
            data.error || 'Falha ao criar jogador'
          );
        }
      } catch (error) {
        this.loadingService.hide();
        this.popupService.error(
          'Erro de conexão', 
          'Erro de rede. Tente novamente.'
        );
        console.error('Error creating player:', error);
      }
    }
  }

  get isLoading(): boolean {
    return this.loadingService.isLoading();
  }
}
