module.exports = {
  apps: [
    {
      name: 'room-rental-server',
      script: 'server/src/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      watch: false,
      instances: 1,
      autorestart: true,
    },
  ],
};
