const path = require('path');

module.exports = {
  // Entry points for your scripts
  entry: {
    content: './content.js', // Your content script
  },
  // Output configuration
  output: {
    filename: '[name].js', // Outputs content.js and background.js
    path: path.resolve(__dirname, 'dist'), // Output directory
  },
  // Plugins
  // plugins: [
  //   new Dotenv(), // Load .env variables
  // ],
  // Development mode (change to 'production' for     final build)
  mode: 'development',
};