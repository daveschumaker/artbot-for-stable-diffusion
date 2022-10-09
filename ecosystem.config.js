module.exports = {
  apps: [
    {
      name: 'next-horde-frontend',
      script: 'npm',
      args: 'start',
      restart_delay: 5000,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}
