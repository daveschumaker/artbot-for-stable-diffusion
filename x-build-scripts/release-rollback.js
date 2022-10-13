/**
 * Easily reollback to a previous build on remote server
 * and restart the process with minimal downtime.
 */
require('dotenv').config()
const Application = require('ssh-deploy-release')

const [, , deployEnv] = process.argv
const validArgs = ['--prod', '--staging']
let DEPLOY_PATH
let pm2Scripts

if (!validArgs.includes(deployEnv)) {
  console.log(`Error: Missing a valid environment flag.`)
  process.exit()
}

if (deployEnv === '--staging') {
  console.log(`-- Rolling back STAGING environment`)
  DEPLOY_PATH = process.env.STAGING_PATH
  pm2Scripts = `npm run pm2:stop-staging && sleep 1s && npm run pm2:start-staging`
}

if (deployEnv === '--prod') {
  console.log(`-- Rolling back PROD environment`)
  DEPLOY_PATH = process.env.PROD_PATH
  pm2Scripts = `npm run pm2:stop-prod && sleep 1s && npm run pm2:start-prod`
}

const options = {
  host: process.env.HOST,
  username: process.env.USERNAME,
  password: process.env.PW,
  deployPath: DEPLOY_PATH,
  onAfterRollback: [
    `source ~/.zshrc && cd ${DEPLOY_PATH}/www && ${pm2Scripts} && pm2 save`
  ]
}

const deployer = new Application(options)
deployer.rollbackToPreviousRelease(() => {
  console.log('Ok !')
})
