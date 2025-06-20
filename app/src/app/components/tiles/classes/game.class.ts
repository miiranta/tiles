import { TICKS_PER_SECOND } from "../constants/game-config.consts";
import { DrawManager } from "./managers/draw-manager.class";
import { KeyManager } from "./managers/key-manager.class";
import { MultiplayerManager } from "./managers/multiplayer-manager.class";
import { Player } from "./player/player.class";
import { TileMap } from "./map/tile-map.class";

export class Game {
  drawManager: DrawManager = new DrawManager();
  keyManager: KeyManager = new KeyManager();
  multiplayerManager: MultiplayerManager = new MultiplayerManager();
  
  map!: TileMap;
  player!: Player;
  canvas: any;
  api: any;
  playerId: string;

  constructor(canvas: any, api: any, playerId: string) {
    this.playerId = playerId;
    if(this.playerId == '' || this.playerId == undefined) {
      playerId = Math.random().toString(36).substring(2, 15);
      this.playerId = playerId;
    }
    
    this.canvas = canvas.nativeElement;
    if(!this.canvas) { return; }

    this.api = api;
    if(!this.api) { return; }

    this.map = new TileMap(this.api);
    if(!this.map) { return; }

    this.player = new Player(this.playerId);
    if(!this.player) { return; }

    this.drawManager.setGameTarget(this);
    this.multiplayerManager.setGameTarget(this);

    setInterval(this.gameLoop.bind(this), 1000 / TICKS_PER_SECOND);
    setInterval(this.drawLoop.bind(this), 0);
    setInterval(this.apiLoop.bind(this), 5);
  }

  gameLoop() {
    // Update player speed
    this.player.updateSpeed(this.keyManager.keyMap);
    this.player.updatePosition();
  }

  drawLoop() {
    this.drawManager.clear();
    this.drawManager.draw();
  }

  apiLoop() {
    this.multiplayerManager.sendPlayerPosition();
    this.multiplayerManager.filterOldPlayers();
    this.multiplayerManager.listenTilePlaced();
  }
}