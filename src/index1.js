const fs = require('fs');
const EventEmitter = require('events');
const throttle = require('lodash/throttle');

class SmartFSWatch extends EventEmitter {
  constructor(paths, options = {}) {
    super();
    this.paths = Array.isArray(paths) ? paths : [paths];
    this.options = options;
    this.throttleTime = this.options.throttleTime || 500; // in milliseconds
    this.batchTime = this.options.batchTime || 1000; // in milliseconds
    this.watchers = [];
    this.eventQueue = [];

    this.interval = null;

    this.startWatching();
    process.nextTick(() => this.startWatching());
  }

  startWatching() {
    this.paths.forEach((path) => {
      try {
        const watcher = fs.watch(path, { encoding: 'buffer' }, throttle((eventType, filename) => {
          if (filename) {
            this.eventQueue.push({ eventType, filename: filename.toString() });
          }
        }, this.throttleTime));

        watcher.on('error', (error) => {
          this.emit('error', error);
        });

        this.watchers.push(watcher);
      } catch (error) {
        process.nextTick(() => {
          this.emit('error', new Error(`Failed to watch path: ${path}. Error: ${error.message}`));
        });
        
      }
    });

    this.interval = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.emit('batch', [...this.eventQueue]);
        this.eventQueue = [];
      }
    }, this.batchTime);
  }

  close() {
    clearInterval(this.interval);
    this.watchers.forEach((watcher) => watcher.close());
    this.interval = null; // Clear the reference
  }

  init() {
    process.nextTick(() => this.startWatching());
  }
}

module.exports = SmartFSWatch;
