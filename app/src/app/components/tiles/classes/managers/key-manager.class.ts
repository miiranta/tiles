export class KeyManager {
  keyMap: Map<string, boolean> = new Map();
  scrollIndex: number = 0;

  constructor() {
    // Listen for keydown events
    window.addEventListener('keydown', this.keydown.bind(this));
    // Listen for keyup events
    window.addEventListener('keyup', this.keyup.bind(this));
    // Listen for scroll events
    window.addEventListener('wheel', this.scroll.bind(this));
  }
  
  keydown(event: KeyboardEvent) {
    this.keyMap.set(event.key, true);
  }

  keyup(event: KeyboardEvent) {
    this.keyMap.set(event.key, false);
  }

  scroll(event: Event) {
    const wheelEvent = event as WheelEvent;
    this.scrollIndex = this.scrollIndex + wheelEvent.deltaY;
  }

}