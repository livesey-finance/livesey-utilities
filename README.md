# livesey-utilities

`livesey-utilities` is a module for managing concurrency and synchronization in Node.js. 🚀 It provides simple and efficient tools for handling concurrent access to resources and task queues, making it valuable for developers working with multi-threaded applications. ⚙️

## Table of Contents:
1. [Getting Started](#getting-started)
   - [Installation](#installation)
   - [Usage](#usage)
2. [Features](#features)
   - [Binary Semaphore](#binary-semaphore)
   - [Counting Semaphore](#counting-semaphore)
   - [Mutex](#mutex)
   - [Asynchronous Queue](#asynchronous-queue)
3. [API Reference](#api-reference)
   - [Binary Semaphore API](#binary-semaphore-api)
   - [Counting Semaphore API](#counting-semaphore-api)
   - [Mutex API](#mutex-api)
   - [Asynchronous Queue API](#asynchronous-queue-api)
4. [Tests](#tests)
5. [Contributing](#contributing)
6. [License](#license)
7. [Contact](#contact)


## Getting Started

### Installation

```bash
npm install livesey-utilities
```

You can install the module via [npm]("")

---

### Usage

After installation, you can use `livesey-utilities` by importing it into your Node.js project. The module includes several concurrency primitives and an asynchronous queue for task management.

```js
import { BinarySemaphore, CountingSemaphore, Mutex, AsyncQueue } from 'livesey-utilities';

// Example usage here...
```

---

<p align="right">(<a href="#table-of-contents">back to top</a>)</p>

## Features

### Binary Semaphore
A `BinarySemaphore` ensures that only one thread can access a critical section at any given time.

```js
import { BinarySemaphore } from 'livesey-utilities';

const buffer = new SharedArrayBuffer(16);
const semaphore = new BinarySemaphore(buffer);

semaphore.enterCriticalSection();
// Critical work
semaphore.leaveCriticalSection();
```

---

### Counting Semaphore
A `CountingSemaphore` allows a fixed number of threads to enter a critical section concurrently.

```js
import { CountingSemaphore } from 'livesey-utilities';

const buffer = new SharedArrayBuffer(16);
const semaphore = new CountingSemaphore(buffer, 0, 2); // Allows 2 threads at a time

semaphore.enterCriticalSection();
// Work within critical section
semaphore.leaveCriticalSection();
```

---

### Mutex
A `Mutex` ensures exclusive access to a resource by a single thread, which must also be the one to unlock it.

```js
import { Mutex } from 'livesey-utilities';

const buffer = new SharedArrayBuffer(16);
const mutex = new Mutex(null, buffer, 0);

mutex.enterCriticalSection();
// Exclusive work here
mutex.leaveCriticalSection();
```

---

### Asynchronous Queue
The `AsyncQueue` manages asynchronous tasks with configurable concurrency, handling task timeouts and success/error callbacks.

```js
import { AsyncQueue } from 'livesey-utilities';

const queue = AsyncQueue.channels(2) // 2 concurrent tasks
  .success(result => console.log('Task completed:', result))
  .drain(() => console.log('All tasks are finished'));

const asyncTask = async (num) => new Promise(resolve => setTimeout(() => resolve(num), 100));

for (let i = 0; i < 5; i++) {
  queue.add(() => asyncTask(i));
}
```

---

<p align="right">(<a href="#table-of-contents">back to top</a>)</p>


Here’s the completed section of the **API Reference** for the `livesey-utilities` package:

---

## API Reference

### Binary Semaphore API

#### Constructor

-  `new BinarySemaphore(sharedBuffer, offset = 0)`

  * `sharedBuffer` - An instance of `SharedArrayBuffer`, used to store the semaphore's state.
  * `offset` - (optional) Offset in the `SharedArrayBuffer` where the semaphore starts. Default is `0`.

#### Methods

-  `enterCriticalSection()`
   * Acquires the semaphore. If it is already locked, the calling thread will block until the semaphore is available.

-  `leaveCriticalSection()`
   * Releases the semaphore, allowing another thread to acquire it. Throws an error if the semaphore is already unlocked.

---

### Counting Semaphore API

#### Constructor

-  `new CountingSemaphore(sharedBuffer, offset = 0, initialValue = 0)`

  * `sharedBuffer` - An instance of `SharedArrayBuffer`, used to store the semaphore's count.
  * `offset` - (optional) Offset in the `SharedArrayBuffer` where the semaphore starts. Default is `0`.
  * `initialValue` - (optional) Initial value of the semaphore's count, representing the number of threads allowed to enter the critical section concurrently.

#### Methods

-  `enterCriticalSection()`
   * Decreases the semaphore's count and enters the critical section. If the count is zero, the thread will block until another thread releases the semaphore.

-  `leaveCriticalSection()`
   * Increases the semaphore's count, allowing another thread to enter the critical section.

---

### Mutex API

#### Constructor

-  `new Mutex(worker, sharedBuffer, offset)`

  * `worker` - An instance of `Worker` (from `node:worker_threads`), identifying the thread that owns the mutex.
  * `sharedBuffer` - An instance of `SharedArrayBuffer`, used to store the mutex's state.
  * `offset` - Offset in the `SharedArrayBuffer` where the mutex starts.

#### Methods

-  `enterCriticalSection()`
   * Acquires the mutex. If the mutex is already locked, the calling thread will block until it is unlocked.

-  `leaveCriticalSection()`
   * Releases the mutex, allowing another thread to acquire it. Throws an error if the calling thread does not own the mutex or if the mutex is already unlocked.

---

### Asynchronous Queue API

#### Constructor

-  `new AsyncQueue(concurrency)`

  * `concurrency` - Number of concurrent tasks that the queue can process simultaneously.

#### Methods

-  `wait(waitTimeout)`
   * Sets a timeout (in milliseconds) for how long tasks can wait in the queue before being rejected. Default is `Infinity`.

-  `timeout(processTimeout)`
   * Sets a timeout (in milliseconds) for how long each task can run before being forcibly terminated. Default is `Infinity`.

-  `add(task)`
   * Adds a new asynchronous task to the queue. The task is a function that returns a promise.

-  `async next(task)`
   * Processes the next task in the queue. Automatically invoked when a new task is added and a slot is available.

-  `takeNext()`
   * Retrieves the next task from the queue and processes it if a concurrency slot is available.

-  `finish(err, res)`
   * Invoked after a task is completed or an error occurs. Calls success or failure callbacks based on the result.

-  `success(listener)`
   * Registers a callback function to be executed when a task completes successfully.

-  `done(listener)`
   * Registers a callback function to be executed after each task, regardless of success or failure.

-  `drain(listener)`
   * Registers a callback function to be executed when all tasks in the queue have been processed.

---

<p align="right">(<a href="#table-of-contents">back to top</a>)</p>

## Tests

To run tests:
```bash
npm run test
```

---

<p align="right">(<a href="#table-of-contents">back to top</a>)</p>

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Push to your branch (`git push origin feature-branch`).
5. Open a pull request.

---

<p align="right">(<a href="#table-of-contents">back to top</a>)</p>

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
 ---

<p align="right">(<a href="#table-of-contents">back to top</a>)</p>

## Contact

**Heorhii Huziuk** - [huziukwork@gmail.com](mailto:huziukwork@gmail.com)

Project Repository: [https://github.com/livesey-finance/livesey-utilities](https://github.com/livesey-finance/livesey-utilities)

---

<p align="right">(<a href="#table-of-contents">back to top</a>)</p>