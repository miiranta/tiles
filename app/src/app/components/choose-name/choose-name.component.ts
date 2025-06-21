import { Component, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlayerService } from '../../services/player.service';
import { LoadingService } from '../../services/loading.service';
import { ApiPlayerService } from '../../services/api-player.service';
import { PopupService } from '../../services/popup.service';

@Component({
  selector: 'app-choose-name',
  imports: [FormsModule, CommonModule],
  templateUrl: './choose-name.component.html',
  styleUrl: './choose-name.component.scss'
})
export class ChooseNameComponent implements OnDestroy {
  @Output() passwordNeeded = new EventEmitter<{ playerName: string, isNewPlayer: boolean }>();
  
  name: string = '';
  isCheckingName: boolean = false;
  nameStatus: 'available' | 'taken' | 'exists' | 'invalid' | 'idle' = 'idle';
  private checkNameTimeout: any = null;

  constructor(
    private router: Router, 
    private playerService: PlayerService,
    private loadingService: LoadingService,
    private apiPlayerService: ApiPlayerService,
    private popupService: PopupService
  ) {}

  onNameInput() {
    // Clear previous timeout
    if (this.checkNameTimeout) {
      clearTimeout(this.checkNameTimeout);
    }

    const trimmedName = this.name.trim();
    
    // Reset status if name is empty
    if (!trimmedName) {
      this.nameStatus = 'idle';
      return;
    }

    // Check length requirements
    if (trimmedName.length < 2 || trimmedName.length > 20) {
      this.nameStatus = 'invalid';
      return;
    }

    // Set checking state and delay the API call
    this.isCheckingName = true;
    this.nameStatus = 'idle';
    
    this.checkNameTimeout = setTimeout(async () => {
      await this.checkNameAvailability(trimmedName);
    }, 300);
  }
  private async checkNameAvailability(playerName: string) {
    try {
      const response = await this.apiPlayerService.checkPlayerNameAvailability(playerName);
      const data = await response.json();
      
      this.isCheckingName = false;
      
      if (response.ok) {
        if (data.currentlyConnected) {
          this.nameStatus = 'taken';
        } else if (data.existsInDatabase) {
          this.nameStatus = 'exists';
        } else {
          this.nameStatus = 'available';
        }
      } else {
        this.nameStatus = 'invalid';
      }
    } catch (error) {
      console.error('Error checking name availability:', error);
      this.isCheckingName = false;
      this.nameStatus = 'idle'; // Reset to idle on error
    }
  }  
    async openGame() {
    if (this.name.trim() && !this.loadingService.isLoading() && (this.nameStatus === 'available' || this.nameStatus === 'exists')) {
      // Emit event to parent component
      this.passwordNeeded.emit({
        playerName: this.name.trim(),
        isNewPlayer: this.nameStatus === 'available'
      });
    }
  }

  get isLoading(): boolean {
    return this.loadingService.isLoading();
  }

  get canSubmit(): boolean {
    return this.name.trim().length >= 2 && 
           this.name.trim().length <= 20 && 
           (this.nameStatus === 'available' || this.nameStatus === 'exists') && 
           !this.isCheckingName && 
           !this.isLoading;
  }

  ngOnDestroy() {
    if (this.checkNameTimeout) {
      clearTimeout(this.checkNameTimeout);
    }
  }
}
