const { SchedulerInterrupt } = require('./constants/index');

// A class representation of a process that may be blocking
// or non-blocking. We can specify how much CPU time a process
// needs in order to complete, or we can specify if the process
// is blocking; if so, the amount of blocking time needed is
// randomly determined.
class Process {
    constructor(pid, cpuTimeNeeded=null, blocking=false) {
        this.pid = pid;
        this.queue = null;
        this.cpuTimeNeeded = (cpuTimeNeeded !== null) ? cpuTimeNeeded : Math.round(Math.random() * 1000);
        this.blockingTimeNeeded = blocking ? Math.round(Math.random() * 100) : 0;
        // A bool representing whether this process was toggled from blocking to non-blocking or vice versa
        this.stateChanged = false;
    }
    
    setParentQueue(queue) {
        this.queue = queue;
    }

    isFinished() {
        if (this.cpuTimeNeeded <= 0 && this.blockingTimeNeeded <= 0) return true;
        return false;
    }

    // If no blocking time is needed by this process, decrement the amount of 
    // CPU time it needs by the input time
    // If blocking time is needed by this process, move it to the blocking queue
    // by emitting the appropriate interrupt
    // Make sure the `stateChanged` flag is toggled appropriately
    executeProcess(time) {
        if (this.blockingTimeNeeded === 0) {
            for (let i = 0; i < time; i++) {
                if (this.cpuTimeNeeded > 0) this.cpuTimeNeeded--;
            }
        }
        else {
            this.stateChanged = !this.stateChanged;
            this.queue.emitInterrupt(this , 'PROCESS_BLOCKED');
        }
    }

    // If this process requires blocking time, decrement the amount of blocking
    // time it needs by the input time
    // Once it no longer needs to perform any blocking execution, move it to the 
    // top running queue by emitting the appropriate interrupt
    // Make sure the `stateChanged` flag is toggled appropriately
    executeBlockingProcess(time) {
        if (this.blockingTimeNeeded > 0) {
            for (let i = 0; i < time; i++) {
                if (this.blockingTimeNeeded > 0) this.blockingTimeNeeded--;
            }
        }
        if (this.blockingTimeNeeded === 0) {
            this.stateChanged = !this.stateChanged;
            this.queue.emitInterrupt(this , 'PROCESS_READY');
        }
    }

    // Returns this process's stateChanged property
    isStateChanged() {
        return this.stateChanged;
    }

    pid() {
        return this.pid;
    }

    // Private function used for testing; DO NOT MODIFY
    _getParentQueue() {
        return this.queue;
    }
}

module.exports = Process;
