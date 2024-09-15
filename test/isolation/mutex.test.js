import * as threads from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { Mutex } from '../../src/isolation/mutex.js';

const { Worker, isMainThread } = threads;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (isMainThread) {
  const buffer = new SharedArrayBuffer(14);
  const mutex = new Mutex(null, buffer, 0);

  console.dir({ mutex });

  // Створюємо нові потоки
  new Worker(__filename, { workerData: buffer });
  new Worker(__filename, { workerData: buffer });
} else {
  const { threadId, workerData } = threads;
  const mutex = new Mutex(threads, workerData, 0);
  const array = new Int8Array(workerData, 4);
  const value = threadId === 1 ? 1 : -1;

  setInterval(() => {
    mutex.enterCriticalSection();
    try {
      for (let i = 0; i < 10; i++) {
        array[i] += value;
      }
      console.log(JSON.stringify([threadId, mutex.lock[0], Array.from(array)]));
    } finally {
      mutex.leaveCriticalSection();
    }
  }, 100);
}
