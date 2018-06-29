const Queue = require("./Queue");
const { QueueType, PRIORITY_LEVELS } = require("./constants/index");

// A class representing the scheduler
// It holds a single blocking queue for blocking processes and three running queues
// for non-blocking processes
class Scheduler {
  constructor() {
    this.clock = Date.now();
    this.blockingQueue = new Queue(this, 50, 0, QueueType.BLOCKING_QUEUE);
    this.runningQueues = [];
    // Initialize all the CPU running queues
    for (let i = 0; i < PRIORITY_LEVELS; i++) {
      this.runningQueues[i] = new Queue(
        this,
        10 + i * 20,
        i,
        QueueType.CPU_QUEUE
      );
    }
  }

  // Executes the scheduler in an infinite loop as long as there are processes in any of the queues
  // Calculate the time slice for the next iteration of the scheduler by subtracting the current
  // time from the clock property. Don't forget to update the clock property afterwards.
  // On every iteration of the scheduler, if the blocking queue is not empty, blocking work
  // should be done. Once the blocking work has been done, perform some CPU work in the same iteration.
  run() {
    while (true) {
      const time = Date.now();
      const workTime = time - this.clock;
      this.clock = time;

      if (!this.blockingQueue.isEmpty()) {
        this.blockingQueue.doBlockingWork(workTime);
      }

      for (let i = 0; i < PRIORITY_LEVELS; i++) {
        const queue = this.runningQueues[i];
        if (!queue.isEmpty()) {
          queue.doCPUWork(workTime);
          break;
        }
      }

      if (this.allQueuesEmpty()) {
        console.log("No more processes! I can sleep now.");
        break;
      }
    }
  }

  allQueuesEmpty() {
    let empty = true;
    this.runningQueues.forEach(
      queue => (!queue.isEmpty() ? (empty = false) : null)
    );
    return empty && this.blockingQueue.isEmpty();
  }

  addNewProcess(process) {
    this.runningQueues[0].enqueue(process);
  }

  // The scheduler's interrupt handler that receives a queue, a process, and an interrupt string constant
  // Should handle PROCESS_BLOCKED, PROCESS_READY, and LOWER_PRIORITY interrupts.
  handleInterrupt(queue, process, interrupt) {
    if (interrupt === "PROCESS_BLOCKED") {
      this.blockingQueue.enqueue(process);
    }
    if (interrupt === "PROCESS_READY") {
      this.addNewProcess(process);
    }
    if (interrupt === "LOWER_PRIORITY") {
      if (queue.getQueueType() === QueueType.CPU_QUEUE) {
        const priorityLevel = queue.getPriorityLevel();
        if (priorityLevel < PRIORITY_LEVELS - 1) {
          this.runningQueues[priorityLevel + 1].enqueue(process);
        } else {
          this.runningQueues[priorityLevel].enqueue(process);
        }
      } else {
        this.blockingQueue.enqueue(process);
      }
    }
    process.isFinished() ? queue.dequeue() : null;
  }

  // Private function used for testing; DO NOT MODIFY
  _getCPUQueue(priorityLevel) {
    return this.runningQueues[priorityLevel];
  }

  // Private function used for testing; DO NOT MODIFY
  _getBlockingQueue() {
    return this.blockingQueue;
  }
}

module.exports = Scheduler;
