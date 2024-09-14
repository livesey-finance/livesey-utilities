export class BinarySemaphore {
  constructor(shared, offset = 0, initialValue = 0) {
    this.count = new Int32Array(shared, offset, 1);
    if (typeof initialValue === 'number') Atomics.store(this.counter, 0, initial);
  }

  enterCriticalSection() {
    while (true) {
      Atomics.wait(this.count, 0, 0);
      const current = Atomics.load(this.count, 0);
      if (current > 0) {
        const prev = Atomics.compareExchange(this.count, 0, current, current - 1);
        if (prev === current) return;
      }
    }
  }

  leaveCriticalSection() {
    Atomics.add(this.count, 0, 1);
    Atomics.notify(this.count, 0, 1);
  }
}
