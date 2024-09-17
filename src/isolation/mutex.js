import { threadId, Worker } from 'node:worker_threads';

const LOCKED = 1;
const UNLOCKED = 0;

export class Mutex {
  constructor(worker, shared, offset) {
    if (worker instanceof Worker) this.creator = worker.threadId;
    this.owner = null;
    this.lock = new Int32Array(shared, offset, 1);
    Atomics.store(this.lock, 0, UNLOCKED);
  }

  enterCriticalSection() {
    let prev = Atomics.exchange(this.lock, 0, LOCKED);
    while (prev !== UNLOCKED) {
      Atomics.wait(this.lock, 0, LOCKED);
      prev = Atomics.exchange(this.lock, 0, LOCKED);
    }
    this.owner = threadId;
  }

  leaveCriticalSection() {
    if (this.owner !== threadId) {
      throw new Error('Mutex can only be unlocked by the thread that locked it');
    }
    if (Atomics.load(this.lock, 0) === UNLOCKED) {
      throw new Error('Cannot leave unlocked Mutex');
    }
    Atomics.store(this.lock, 0, UNLOCKED);
    Atomics.notify(this.lock, 0, 1);
    this.owner = null;
  }
}
