const path = require('path');

module.exports = {
  entry: {
    index: './index.js',
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js',
  },
  target: 'node',
};
