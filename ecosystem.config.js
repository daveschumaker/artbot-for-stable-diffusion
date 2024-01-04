module.exports = {
  apps: [
    {
      name: 'horde-js',
      script: 'npm',
      args: 'start',
      restart_delay: 5000,
      env: {
        NODE_ENV: 'production',
        PORT: 49997
      }
    },
    {
      name: 'artbot-beta',
      script: 'npm',
      args: 'start',
      restart_delay: 5000,
      env: {
        BASE_PATH: '/artbot-beta',
        NODE_ENV: 'production',
        PORT: 49996
      }
    }
  ]
}
