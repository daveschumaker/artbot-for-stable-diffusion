// ArtBot needs a newer Node than the other apps on the server, so it runs on its
// own copy. Starting Next directly stops PM2 from using its own Node version.
const interpreter = '/root/.nvm/versions/node/v24.22.2/bin/node'
const script = 'node_modules/next/dist/bin/next'

module.exports = {
  apps: [
    {
      name: 'horde-js',
      script,
      args: 'start',
      interpreter,
      restart_delay: 5000,
      env: {
        NODE_ENV: 'production',
        PORT: 49997
      }
    },
    {
      name: 'artbot-beta',
      script,
      args: 'start',
      interpreter,
      restart_delay: 5000,
      env: {
        BASE_PATH: '/artbot-beta',
        // The server writes its counters and settings to the home directory.
        // A separate one keeps beta from overwriting production's files.
        HOME: '/root/artbot-beta/data',
        NODE_ENV: 'production',
        PORT: 49996
      }
    }
  ]
}
