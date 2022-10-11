/**
 * Easily deploy a completed build to my remote server and restart the process with minimal downtime.
 */
require('dotenv').config()
const Application = require('ssh-deploy-release')

const options = {
  localPath: process.cwd(),
  exclude: ['release.tar.gz'],
  archiveName: 'release.tar.gz',
  host: process.env.HOST,
  username: process.env.USERNAME,
  password: process.env.PW,
  deployPath: process.env.DEPLOY_PATH,
  onAfterDeploy: [
    `source ~/.zshrc && cd ${process.env.DEPLOY_PATH}/www && npm run pm2:stop && sleep 1s && npm run pm2:start && pm2 save`
  ]
}

const deployer = new Application(options)
deployer.deployRelease(() => {
  console.log('Ok !')
})
