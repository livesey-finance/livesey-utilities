// Implementation
const LOCKED = 1;
const UNLOCKED = 0;

export class BinarySemaphore {
  constructor(shared, offset = 0, init = false) {
    this.lock = new Int32Array(shared, offset, 1);
    if (init) Atomics.store(this.lock, 0, UNLOCKED);
  }

  enterCriticalSection() {
    let prev = Atomics.exchange(this.lock, 0, LOCKED);
    while (prev !== UNLOCKED) {
      Atomics.wait(this.lock, 0, LOCKED);
      prev = Atomics.exchange(this.lock, 0, LOCKED);
    }
  }

  leaveCriticalSection() {
    if (Atomics.load(this.lock, 0) === UNLOCKED) {
      throw new Error('Cannot leave unlocked BinarySemaphore');
    }
    Atomics.store(this.lock, 0, UNLOCKED);
    Atomics.notify(this.lock, 0, 1);
  }
}

