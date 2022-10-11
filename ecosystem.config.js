module.exports = {
  apps: [
    {
      name: 'horde-js',
      script: 'npm',
      args: 'start',
      restart_delay: 5000,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}
