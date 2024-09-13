import { Queue } from './src/queue/queue.js';

const queue = Queue.channels(2);

queue
  .success((result) => console.log('Task completed with result:', result))
  .drain(() => console.log('drain'));

const asyncTask = async (num) => new Promise((resolve) => setTimeout(() => resolve(num), 100));

for (let i = 0; i < 10; i++) {
  queue.add(() => asyncTask(i));
}
