import { Game } from "../game.class";
import { Player } from "../player/player.class";
import { Tile } from "../map/tile.class";

export class MultiplayerManager {
  private game!: Game;

  public all_players: Map<string, Player> = new Map();

  constructor() { 
    // Do nothing here, please
  }

  setGameTarget(game: Game) {
    this.game = game;

    this.listenPlayerPositions();
  }

  // Player position
  sendPlayerPosition() {
    const player_coords = this.game.player.getPositionFloat();
    this.game.api.sendPlayerPosition(this.game.player.playerId, player_coords.x, player_coords.y);
  }

  listenPlayerPositions() {
    this.game.api.on('playerPosition').subscribe((data: any) => {
      // Test if the player is already in the map
      if (this.all_players.has(data.playerId)) {
        var player = this.all_players.get(data.playerId)!;
        player.x = data.x;
        player.y = data.y;
        player.last_update = Date.now();
      } else {
        const newPlayer = new Player(data.playerId);
        newPlayer.x = data.x;
        newPlayer.y = data.y;
        newPlayer.last_update = Date.now();
        this.all_players.set(data.playerId, newPlayer);
      }
    });
  }

  filterOldPlayers() {
    const now = Date.now();
    const timeout = 1000; // 1 seconds

    this.all_players.forEach((player, playerId) => {
      if (now - player.last_update > timeout) {
        this.all_players.delete(playerId);
      }
    });
  }

  // Tile update
  listenTilePlaced() {
    this.game.api.on('tilePlaced').subscribe((data: any) => {
      const tile = new Tile(data.x, data.y, data.type);
      this.game.map.placeTileLocal(tile.x, tile.y, tile.type);
    });
  }

}