import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-choose-name',
  imports: [FormsModule],
  templateUrl: './choose-name.component.html',
  styleUrl: './choose-name.component.scss'
})
export class ChooseNameComponent {
  name: string = '';

  constructor(private router: Router, private playerService: PlayerService) {}

  openGame() {
    if (this.name.trim()) {
      this.playerService.setPlayerName(this.name);
      this.router.navigate(['/tiles']);
    }
  }
}
