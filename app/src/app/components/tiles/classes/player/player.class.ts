import { TICKS_PER_SECOND } from "../../constants/game-config.consts";

export class Player {
  private x_speed: number = 0;
  private y_speed: number = 0;
  public x: number = 0;
  public y: number = 0;
  public playerId: string;
  public last_update: number = 0;
  public randomRgbColor: string = '';

  constructor(playerId: string) {
    this.playerId = playerId;
    this.randomRgbColor = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
  }

  getPosition() {
    const x_int = Math.round(this.x);
    const y_int = Math.round(this.y);

    return { x: x_int, y: y_int };
  }

  getPositionFloat() {
    return { x: this.x, y: this.y };
  }

  getSpeed() {
    const x_speed_int = Math.round(this.x_speed);
    const y_speed_int = Math.round(this.y_speed);

    return { x: x_speed_int, y: y_speed_int };
  }

  updateSpeed(keyMap: Map<string, boolean>) {
    // Speed down
    this.x_speed *= 0.85;
    this.y_speed *= 0.85;
    if(Math.abs(this.x_speed) < 0.1) {
      this.x_speed = 0;
    }
    if(Math.abs(this.y_speed) < 0.1) {
      this.y_speed = 0;
    }

    // Speed up
    if (keyMap.get('w') || keyMap.get('ArrowUp')) {
      this.y_speed -= 2;
    }
    if (keyMap.get('a') || keyMap.get('ArrowLeft')) {
      this.x_speed -= 2;
    }
    if (keyMap.get('s') || keyMap.get('ArrowDown')) {
      this.y_speed += 2;
    }
    if (keyMap.get('d') || keyMap.get('ArrowRight')) {
      this.x_speed += 2;
    }
  }

  updatePosition() {
    this.x += this.x_speed / TICKS_PER_SECOND;
    this.y += this.y_speed / TICKS_PER_SECOND;

    // Ints
    let x_int = Math.round(this.x);
    let y_int = Math.round(this.y);

    // Sum 1 to speed direction
    if (this.x_speed > 0) {
      x_int += 1;
    }else if (this.x_speed < 0) {
      x_int -= 1;
    }
    if (this.y_speed > 0) {
      y_int += 1;
    }else if (this.y_speed < 0) {
      y_int -= 1;
    }

    // Update float to walk a little bit in int direction
    this.x = x_int * 0.02 + this.x * 0.98;
    this.y = y_int * 0.02 + this.y * 0.98;
  }

}