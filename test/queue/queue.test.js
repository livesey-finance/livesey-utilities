import tap from 'tap';
import { AsyncQueue } from '../../src/queue/asyncQueue.js';

tap.test('AsyncQueue basic functionality', (t) => {
  const concurrency = 2;
  const queue = AsyncQueue.channels(concurrency);
  const results = [];
  const expectedResults = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  queue
    .success((result) => {
      results.push(result);
    })
    .drain(() => {
      t.ok(true, 'Queue drained');
      t.same(results, expectedResults, 'Results should match expected order');
      t.end();
    });

  const asyncTask = async (num) => new Promise((resolve) => setTimeout(() => resolve(num), 100));

  for (let i = 0; i < 10; i++) {
    queue.add(() => asyncTask(i));
  }

  t.ok(queue, 'Queue should be initialized');
});

tap.test('AsyncQueue with task timeout', (t) => {
  const concurrency = 2;
  const queue = AsyncQueue.channels(concurrency).timeout(50);
  const results = [];
  let doneCalled = false;

  queue
    .success((result) => {
      results.push(result);
    })
    .done((err, result) => {
      if (err) {
        t.match(err.message, /Process timed out/, 'Task should time out');
      }
    })
    .drain(() => {
      if (!doneCalled) {
        doneCalled = true;
        setImmediate(() => t.end());
      }
    });

  const asyncTask = async (num) =>
    new Promise((resolve) => setTimeout(() => resolve(num), 100));

  for (let i = 0; i < 2; i++) {
    queue.add(() => asyncTask(i));
  }

  t.ok(queue, 'Queue should be initialized with task timeout');
});

tap.test('AsyncQueue with wait timeout', (t) => {
  const concurrency = 1;
  const queue = AsyncQueue.channels(concurrency).wait(50);
  const results = [];
  let drainCalled = false;

  queue
    .success((result) => {
      results.push(result);
    })
    .done((err) => {
      if (err) {
        t.match(err.message, /wait timed out/, 'Task should fail due to wait timeout');
      }
    })
    .drain(() => {
      if (!drainCalled) {
        drainCalled = true;
        setImmediate(() => t.end());
      }
    });

  const asyncTask = async (num) =>
    new Promise((resolve) => setTimeout(() => resolve(num), 100));

  for (let i = 0; i < 2; i++) {
    queue.add(() => asyncTask(i));
  }

  t.ok(queue, 'Queue should be initialized with wait timeout');
});
