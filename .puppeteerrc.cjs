const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // هذا المسار الكامل اللي رح يخلي Render يوافق غصب عنه
  cacheDirectory: join('/opt/render/project/src/', '.cache', 'puppeteer'),
};
