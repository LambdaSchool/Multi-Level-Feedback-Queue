const Scheduler = require('./Scheduler');
const Process = require('./Process');
// npm start
// An example of a `main` function that adds a bunch of processes
// to the scheduler, randomly determining if they a running or 
// blocking process, and then runs the scheduler.
// Feel free to edit this file to execute your scheduler implemetation
// in a different way.
// unrealistic in that no new processes are coming in i=once initialized...
const main = () => {
    const scheduler = new Scheduler();

    for (let i = 1; i < 101; i++) {
        let rollForBlockingProcess = Math.random() < 0.25; // percent chance of being a blocking process
        scheduler.addNewProcess(new Process(i + 1000, null, rollForBlockingProcess));
    }

    scheduler.run();
};

main();

