const path = require('path');

module.exports = {
  entry: {
    app: './javascript/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: 'bundle/[name].js',
  },
};
