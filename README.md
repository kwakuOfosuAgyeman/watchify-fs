# SmartFSWatch

SmartFSWatch is a Node.js library providing advanced file system watching capabilities. It's designed to efficiently handle file system events, offering features like event throttling, batching, and comprehensive error handling.

## Features

- **Event Throttling**: Minimizes the number of events emitted by only emitting once in a specified time window.
- **Batch Events**: Accumulates events over a specified period and emits them in batches.
- **Error Handling**: Robustly handles and emits errors for graceful error handling in consuming applications.

## Installation

Install SmartFSWatch using npm:

```bash
npm install smartfswatch
```

Or using yarn:
```bash
yarn add smartfswatch
```

## Usage
Here's a basic example of how to use SmartFSWatch:
```javascript

const SmartFSWatch = require('smartfswatch');

// Initialize watcher
const watcher = new SmartFSWatch('/path/to/watch', {
  throttleTime: 500, // milliseconds
  batchTime: 1000,   // milliseconds
});

// Listen for file changes
watcher.on('change', (event) => {
  console.log(`File ${event.filename} has been changed, event type: ${event.eventType}`);
});

// Listen for batched events
watcher.on('batch', (events) => {
  console.log('Batched events:', events);
});

// Listen for errors
watcher.on('error', (error) => {
  console.error('Error:', error);
});

// Remember to close the watcher when you're done
// to avoid memory leaks
watcher.close();

```



## API
- **Constructor**: new SmartFSWatch(paths, options)
- **Parameters**:
 - *paths*: String or array of strings. Paths to watch.
 - *options*: Object (optional). Options for the watcher.
 - *throttleTime*: Integer. Time in milliseconds to throttle change events. Default is 500ms.
 - *batchTime*: Integer. Time in milliseconds to batch events. Default is 1000ms.
- **Events**:
 - *change*: Emitted for individual file change events. Provides an event object.
 - *batch*: Emitted for batched events. Provides an array of event objects.
 - *error*: Emitted when an error occurs.

## Contributing
Contributions are always welcome! Feel free to open an issue or submit a pull request.