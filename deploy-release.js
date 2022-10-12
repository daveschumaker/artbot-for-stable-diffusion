/**
 * Easily deploy a completed build to my remote server and restart the process with minimal downtime.
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
  console.log(`-- Kicking off deploy to STAGING environment`)
  DEPLOY_PATH = process.env.STAGING_PATH
  pm2Scripts = `npm run pm2:stop-staging && sleep 1s && npm run pm2:start-staging`
}

if (deployEnv === '--prod') {
  console.log(`-- Kicking off deploy to PROD environment`)
  DEPLOY_PATH = process.env.PROD_PATH
  pm2Scripts = `npm run pm2:stop-prod && sleep 1s && npm run pm2:start-prod`
}

const options = {
  localPath: process.cwd(),
  exclude: ['node_modules/**', 'release.tar.gz'],
  archiveName: 'release.tar.gz',
  host: process.env.HOST,
  username: process.env.USERNAME,
  password: process.env.PW,
  deployPath: DEPLOY_PATH,
  onBeforeLink: (context) =>
    `source ~/.zshrc && cd ${context.release.path} && npm install --omit=dev`,
  onAfterDeploy: [
    `source ~/.zshrc && cd ${DEPLOY_PATH}/www && ${pm2Scripts} && pm2 save`
  ]
}

const deployer = new Application(options)
deployer.deployRelease(() => {
  console.log('Ok !')
})
