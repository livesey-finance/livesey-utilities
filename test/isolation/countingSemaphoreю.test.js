import * as threads from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import tap from 'tap';
import { CountingSemaphore } from '../../src/isolation/countingSemaphore.js';

const { Worker, isMainThread, threadId, workerData, parentPort } = threads;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

tap.test('CountingSemaphore test with workers', (t) => {
  if (isMainThread) {
    const buffer = new SharedArrayBuffer(14);
    const semaphore = new CountingSemaphore(buffer, 0, 2);

    t.ok(semaphore, 'CountingSemaphore should be initialized');
    t.same(semaphore.count, new Int32Array(buffer, 0, 1), 'CountingSemaphore count should be initialized correctly');

    const results = [];
    let worker1Completed = false;
    let worker2Completed = false;
    let testEnded = false;

    const worker1 = new Worker(__filename, { workerData: buffer });
    const worker2 = new Worker(__filename, { workerData: buffer });

    worker1.on('message', (msg) => {
      if (Array.isArray(msg) && !testEnded) {
        console.log('Message from worker 1:', msg);
        results.push(msg);
        worker1Completed = true;
        checkCompletion();
      }
    });

    worker2.on('message', (msg) => {
      if (Array.isArray(msg) && !testEnded) {
        console.log('Message from worker 2:', msg);
        results.push(msg);
        worker2Completed = true;
        checkCompletion();
      }
    });

    worker1.on('error', (err) => {
      if (!testEnded) {
        t.fail(`Worker 1 failed: ${err.message}`);
      }
    });

    worker2.on('error', (err) => {
      if (!testEnded) {
        t.fail(`Worker 2 failed: ${err.message}`);
      }
    });

    worker1.on('exit', (code) => {
      if (code !== 0 && !testEnded) {
        t.fail(`Worker 1 exited with code ${code}`);
      }
      worker1Completed = true;
      checkCompletion();
    });

    worker2.on('exit', (code) => {
      if (code !== 0 && !testEnded) {
        t.fail(`Worker 2 exited with code ${code}`);
      }
      worker2Completed = true;
      checkCompletion();
    });

    function checkCompletion() {
      if (results.length >= 2 && worker1Completed && worker2Completed && !testEnded) {
        t.ok(Array.isArray(results[0]), 'Result from worker 1 should be an array');
        t.ok(Array.isArray(results[1]), 'Result from worker 2 should be an array');

        console.log('Results:', results);

        const threadIds = results.map((res) => res[0]);
        t.ok(threadIds.includes(worker1.threadId), 'Worker 1 should be one of the threadIds');
        t.ok(threadIds.includes(worker2.threadId), 'Worker 2 should be one of the threadIds');

        testEnded = true;
        t.end();
      }
    }
  } else {
    const semaphore = new CountingSemaphore(workerData, 0, 2); // Той самий семафор, що використовує потоки
    const array = new Int8Array(workerData, 4);
    const value = threadId === 1 ? 1 : -1;

    semaphore.enterCriticalSection();
    try {
      for (let i = 0; i < array.length; i++) {
        array[i] += value;
      }
      const result = [threadId, semaphore.count[0], Array.from(array)];
      console.log(`Worker ${threadId} sending result:`, result);
      parentPort.postMessage(result);
    } finally {
      semaphore.leaveCriticalSection();
    }

    parentPort.close();
  }
});
