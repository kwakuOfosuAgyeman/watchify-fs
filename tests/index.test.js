const fs = require('fs');
const path = require('path');
const SmartFSWatch = require('../src/index1');

const touchFile = (filePath) => {
  fs.utimesSync(filePath, new Date(), new Date());
};

describe('SmartFSWatch', () => {
  let watcher;
  const testDir = path.join(__dirname, 'testDir');
  const testFilePath = path.join(testDir, 'testFile.txt');

  beforeAll(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir);
    }
    fs.writeFileSync(testFilePath, 'Initial content');
  });

  afterAll(() => {
    if (watcher) {
      watcher.close();
    }
    fs.unlinkSync(testFilePath);
    fs.rmdirSync(testDir);
  });

  test('Should throttle events', (done) => {
    watcher = new SmartFSWatch(testFilePath, { throttleTime: 500, batchTime: 1000 });

    let eventCount = 0;

    watcher.on('batch', () => {
      eventCount++;
    });

    touchFile(testFilePath);
    touchFile(testFilePath);
    touchFile(testFilePath);

    setTimeout(() => {
      expect(eventCount).toBe(1);
      watcher.close();
      done();
    }, 1500);
  });

  test('Should handle errors', (done) => {
    const invalidPath = '/nonexistent';
    watcher = new SmartFSWatch(invalidPath);
  
    const onError = (error) => {
      expect(error).toBeDefined();
      expect(error.message).toContain('Failed to watch path');
      watcher.close();
      watcher.removeListener('error', onError);  // Remove listener to prevent multiple calls
      done();
    };
  
    watcher.on('error', onError);
    watcher.init();
  });
});
