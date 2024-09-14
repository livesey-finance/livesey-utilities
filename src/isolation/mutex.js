const LOCKED = 1;
const UNLOCKED = 0;

export class Mutex {
  constructor() {
    this.master = false;
  }
}
