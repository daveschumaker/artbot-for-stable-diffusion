import AppSettings from 'app/_data-models/AppSettings'
import { userInfoStore } from 'app/_store/userStore'

const tips = [
  {
    id: 'apikey',
    content: () =>
      `Grab an API key! An AI Horde API key allows you to earn kudos through Discord community events or image ratings. It also allows you to jump ahead of anonymous users in the image queue.`,
    linkTitle: `Learn more`,
    linkUrl: `/faq#get-apikey`
  },
  {
    id: 'contact-form',
    content: () =>
      `Found a bug or have a feature suggestion? Don't hesitate to hit the contact form and send a message!`,
    linkTitle: `View page`,
    linkUrl: `/contact`
  },
  {
    id: 'discord-link',
    content: () =>
      `Join the AI Horde community on Discord. Chat about AI, generative art, software development and more. It's a fun community. Come check it out!`,
    linkTitle: `View on Discord`,
    linkUrl: `https://discord.gg/3DxrhksKzn`
  },
  {
    id: 'github-artbot-link',
    content: () =>
      `Interested in free and open-source software or Next.JS and TypeScript? Check out ArtBot on Github! Feel free to make bug reports, suggest improvements, contribute code, or even just give it a ⭐️.`,
    linkTitle: `View on Github`,
    linkUrl: `https://github.com/daveschumaker/artbot-for-stable-diffusion`
  },
  {
    id: 'github-haidra-link',
    content: () =>
      `Want to get involved? Haidra is the community organization behind the AI Horde. Learn more about various Haidra projects and initiatives on their Github page.`,
    linkTitle: `View on Github`,
    linkUrl: `https://github.com/Haidra-Org`
  },
  {
    id: 'promoteHorde',
    content: () =>
      `Share the love! Help spread the word about the AI Horde and ArtBot by sharing images you've generated on Reddit, Mastodon or wherever you consume your favorite internet content.`
  },
  {
    id: 'showcase',
    content: () => (
      <div className="flex flex-row flex-wrap items-center">
        Need inspiration? Check out the image showcase to see what other ArtBot
        users have created and shared with the community.
      </div>
    ),
    linkTitle: `View the showcase`,
    linkUrl: `/showcase`
  },
  {
    id: 'worker',
    content:
      () => `Run a worker! Earn kudos (for faster image generations), help grow the AI
        Horde community, and learn about distributed computing concepts with a
        group of awesome volunteers.`,
    linkTitle: `Learn more`,
    linkUrl: `/faq#run-worker`
  }
]

export const getRandomTip = () => {
  const apikey = AppSettings.get('apiKey')
  const kudos = userInfoStore.state.kudos

  const randomIndex = Math.floor(Math.random() * tips.length)
  const tip = tips[randomIndex]

  if (tip.id === 'worker' && (kudos < 5 || kudos > 50)) {
    return false
  }

  if (tip.id === 'apikey' && apikey) {
    return false
  }

  return tips[randomIndex]
}

export default tips
