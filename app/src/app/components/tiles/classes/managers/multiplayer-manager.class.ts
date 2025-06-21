import { Game } from "../game.class";
import { Player } from "../player/player.class";
import { Tile } from "../map/tile.class";

export class MultiplayerManager {
  private game!: Game;

  public all_players: Map<string, Player> = new Map();

  constructor() { 
    // Do nothing here
  }

  setGameTarget(game: Game) {
    this.game = game;

    this.listenPlayerUpdates();
    this.listenPlayerRemove();
  }
    // Player position updates
  sendPlayerUpdate() {
    const player_coords = this.game.player.getPositionFloat();

    const token = this.game.playerService.getJwtToken();
    
    if (token) {
      this.game.apiPlayer.sendPlayerUpdate(token, player_coords.x, player_coords.y);
    }
  }
  
  
  listenPlayerUpdates() {
    this.game.apiPlayer.on('player-update').subscribe((data: any) => {

      if (data.playerName === this.game.player.playerName) {
        return;
      }
      
      if (this.all_players.has(data.playerName)) {
        var player = this.all_players.get(data.playerName)!;
        player.x = data.x;
        player.y = data.y;
        player.last_update = Date.now();
      } else {
        const newPlayer = new Player(data.playerName);
        newPlayer.x = data.x;
        newPlayer.y = data.y;
        newPlayer.last_update = Date.now();
        this.all_players.set(data.playerName, newPlayer);
      }
    });
  }

  // Listen for player disconnect notifications
  listenPlayerRemove() {
    this.game.apiPlayer.on('player-remove').subscribe((data: any) => {
      if (data.playerName && this.all_players.has(data.playerName)) {
        this.all_players.delete(data.playerName);
        console.log(`Player ${data.playerName} disconnected`);
      }
    });
  }
  // Tile update
  listenMapPlace() {
    this.game.apiPlayer.on('map-place').subscribe((data: any) => {
      const tile = new Tile(data.x, data.y, data.type);
      this.game.map.placeTileLocal(tile.x, tile.y, tile.type);
    });
  }

}