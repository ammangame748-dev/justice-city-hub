const { join } = require('path');

module.exports = {
  // هذا المسار هو اللي Render بيقدر يقرأ منه ويكتب فيه بدون مشاكل
  cacheDirectory: join(__dirname, 'node_modules', '.cache', 'puppeteer'),
};
