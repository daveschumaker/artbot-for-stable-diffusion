const fs = require('fs')

// Check if .env file exists, otherwise, create it.
if (!fs.existsSync('./env')) {
  console.log(`\n\n-== Running ArtBot Post-Install Script==--`)
  console.log(`> creating .env file`)
  fs.writeFile('./.env', '', () => {})
}
