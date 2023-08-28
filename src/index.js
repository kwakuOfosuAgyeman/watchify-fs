const chokidar = require("chokidar");
const glob = require("glob");
const EventEmitter = require("events");
const debounce = require("lodash.debounce");
const throttle = require('lodash/throttle');

class WatchifyFS extends EventEmitter {
    constructor({
        paths,
        filters = [],
        recursive = false,
        debounceTime = 300,
        throttleTime = 100,
        scheduler = null,
        options
      }) {
        super();
        this.paths = paths;
        this.filters = filters;
        this.recursive = recursive;
        this.debounceTime = debounceTime;
        this.throttleTime = throttleTime;
        this.scheduler = scheduler;
        this.paused = false;
        this.eventQueue = [];
        this.options = options;
        this.watchers = [];
        this.startWatching();
    
        const watchOptions = {
          persistent: true,
          ignoreInitial: true,
          cwd: '.',
          depth: this.recursive ? Infinity : 0,
        };
    
        this.watcher = chokidar.watch(this.paths, watchOptions);
    
        const debouncedHandleChange = debounce(this.flushEventQueue.bind(this), this.debounceTime);
        const throttledEmit = throttle(this.emitEvent.bind(this), this.throttleTime);
    
        this.watcher.on('all', (event, path) => {
          if (!this.paused && this.isWithinSchedule() && this.isFiltered(path)) {
            this.eventQueue.push({ type: event, path });
            debouncedHandleChange();
            throttledEmit();
          }
        });
      }

      startWatching() {
        this.options.paths.forEach((path) => {
          const watcher = fs.watch(path, this.options);
    
          // Throttle the 'change' event if throttleTime is specified
          const emitChange = this.options.throttleTime
            ? throttle(this.emitChange.bind(this), this.options.throttleTime)
            : this.emitChange.bind(this);
    
          watcher.on('change', emitChange);
    
          this.watchers.push(watcher);
        });
      }
    
      emitChange(eventType, filename) {
        this.emit('change', { eventType, filename });
      }

      isFiltered(path) {
        return this.filters.length === 0 || this.filters.some((pattern) => glob.sync(pattern, { matchBase: true }).includes(path));
      }
    
      isWithinSchedule() {
        if (!this.scheduler) return true;
        const now = new Date();
        return this.scheduler.start <= now && now <= this.scheduler.end;
      }
    
      emitEvent() {
        if (this.eventQueue.length > 0) {
          this.emit('change', [...this.eventQueue]);
          this.eventQueue = [];
        }
      }
    
      flushEventQueue() {
        if (this.eventQueue.length > 0) {
          this.emit('change', [...this.eventQueue]);
          this.eventQueue = [];
        }
      }
    
      pause() {
        this.paused = true;
      }
    
      resume() {
        this.paused = false;
      }
    
      unwatch() {
        this.watcher.close();
      }
}

module.exports = WatchifyFS;
