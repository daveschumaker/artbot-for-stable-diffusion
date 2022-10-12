module.exports = {
  apps: [
    {
      name: 'horde-js',
      script: 'npm',
      args: 'start -- -p 49997',
      restart_delay: 5000,
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'horde-js-staging',
      script: 'npm',
      args: 'start -- -p 3001',
      restart_delay: 5000,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}
