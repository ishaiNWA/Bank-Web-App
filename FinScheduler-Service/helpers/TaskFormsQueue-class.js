
const EventEmitter = require('events');
const Denque = require("denque");


class TaskFormsQueue extends EventEmitter{

    constructor(){
        super();
        this.taskFormsQueue = new Denque();
    }

    enqueue(task){
    taskFormsQueue.push(task)
    this.emit(NEW_TASK);
    }

    dequeue(){
       return taskFormsQueue.shift();
    }

    peekFront(){
        return this.taskFormsQueue.peekFront();
    }

    isEmpty(){
        return this.taskFormsQueue.isEmpty();
    }

}

TaskFormsQueue.NEW_TASK_EVENT = "newTask";

module.exports = TaskFormsQueue;