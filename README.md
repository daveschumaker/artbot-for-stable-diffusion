# ArtBot for Stable Diffusion

![A painting robot](/public/painting_bot.png)

See it in action: [https://tinybots.net/artbot](https://tinybots.net/artbot)

## Table of Contents

- [Intro](#intro)
- [Setup](#setup)
  - [Requirements](#requirements)
  - [Installing](#installing)
  - [Environmental variables](#environmental-variables)
- [Usage](#usage)
  - [Development](#development)
  - [Production](#production)
- [Troubleshooting](#troubleshooting)
  - [Windows issues](#windows-issues)
  - [Other issues](#other-issues)
- [Contributions](#contributions)
- [License](#license)

## Intro

ArtBot is an unofficial front-end web client designed for interacting with the [Stable Horde](https://aihorde.net/) distributed cluster -- a group of GPUs running Stable Diffusion whose processing time has been kindly donated by an enthusiastic community of volunteers.

ArtBot is built using [Next.js 13](https://nextjs.org/) and [Typescript](https://www.typescriptlang.org/). It with was created as a side project in order to experiment with various client-side technologies, such as IndexedDB and LocalStorage APIs. These APIs allow you to securely and privately store the AI generated images you've created with the cluster within your own browser.

The UI components are custom built using a combination of [Styled Components](https://styled-components.com/) and [Tailwind CSS](https://tailwindcss.com/), with more recent efforts strictly focused on using Tailwind CSS. The long term goal is to completely remove Styled Components from the code base.

ArtBot makes use of icons from [Tabler](https://tabler-icons.io/).

## Setup

### Requirements

- node `>= 18.0.0`
- npm `>= 9.0.0`

Most of these steps should be applicable to Linux / MacOS / Windows environments.

Installing various versions of Node.js on your machine can be tricky. I am a big fan of [nvm](https://github.com/nvm-sh/nvm), which allows you to run multiple isolated versions of Node.js on your machine with ease.

Using `nvm`, you can install Node like this:

```bash
> nvm install v18.16.0
> nvm alias default node
```

### Installing

Once you have your Node.js environment setup, you can clone this repository and install the required packages. Depending on the specs of your machine and speed of your internet connection, installing all packages may take a minute or two.

```bash
> git clone git@github.com:daveschumaker/artbot-for-stable-diffusion.git
> cd artbot-for-stable-diffusion
> npm install
```

### Environmental variables

A `postinstall` script will automatically run that creates a blank `.env` file in the root of the project folder. You don't need to add anything to it, but it's presence is required by the `dotenv` package.

While not required, the code base references a few environmental variables in various places. These are generally endpoints for messaging, telemetry services that I run, or local data storage related to model counts and image generation totals.

## Usage

### Development

**IMPORTANT:** Attempting to run the app this way on a Windows machine will not work. This is due to passing environment variables to the web app with the `npm` scripts. See the [troubleshooting](#troubleshooting) section for more information.

Alright, you should now be able to run the ArtBot web app! To run in development mode (which uses NextJS's hot reloading feature -- where you can see updates live on the site as you make changes)

```bash
> npm run dev
```

Then, open your browser and visit `http://localhost:3000`, you should now be able to immediately make image requests to the Stable Horde. Head over to `http://localhost:3000/artbot/settings` and enter your Stable Horde API key for faster generation times.

### Production

If you want to run this in a production type of environment, you'll first need to kick off a build and then run as you normally would run a Node.JS app.

```bash
> npm run build
> npm run start
```

On TinyBots, my web server for hosting ArtBot, I use [PM2](https://pm2.keymetrics.io/) in order to persist the application and automatically restart after crashes or reboots. You can modify PM2 related settings inside [ecosystem.config.js](ecosystem.config.js).

Additionally, you can start and stop PM2 using:

```bash
> npm run pm2:start-prod
> npm run pm2:stop-prod
```

## Troubleshooting

### Windows issues

As mentioned earlier, attempting to use `npm run dev` or `npm run start` within a Windows environment will result in an error. One possible solution to this is to remove the environment variable. In the case of `npm run dev`, that would look like this.

- Open `package.json`
- Change the `scripts/dev` line to remove `PORT=3000` from the script:

```bash
> npm run update:build-id && node server.js
```

- Save `package.json` and attempt to run again: `> npm run dev`
- It should now work (the web app will default in port 3000, which is automatically set inside [server.js](server.js)

### Other issues

For other issues not mentioned here, feel free to [open a new issue on Github](https://github.com/daveschumaker/artbot-for-stable-diffusion/issues) or visit the [ArtBot feedback channel](https://discord.com/channels/781145214752129095/1038867597543882894) on the Stable Horde Discord server.

## Contributions

Contributions are very welcome! General guidelines are as follows:

1. [Fork this repository](https://github.com/daveschumaker/artbot-for-stable-diffusion/fork)
2. Cut a new feature branch. e.g., `> git checkout -b my-cool-new-feature`
3. Make any necessary changes.
4. [Open a new pull request](https://github.com/daveschumaker/artbot-for-stable-diffusion/pulls) based on your feature branch.

Let me know if you have any questions. I'm more than happy to help.

## License

See [LICENSE.md](LICENSE.md)
