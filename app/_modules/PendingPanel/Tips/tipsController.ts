import AppSettings from 'app/_data-models/AppSettings'
import { userInfoStore } from 'app/_store/userStore'

const tips = [
  {
    id: 'apikey',
    content: `Grab an API key! An AI Horde API key allows you to earn kudos through Discord community events or image ratings. It also allows you to jump ahead of anonymous users in the image queue.`,
    linkTitle: `Learn more`,
    linkUrl: `/faq#get-apikey`
  },
  {
    id: 'worker',
    content: `Run a worker! Earn kudos (for faster image generations), help grow the AI
        Horde community, and learn about distributed computing concepts with a
        group of awesome volunteers.`,
    linkTitle: `Learn more`,
    linkUrl: `/faq#run-worker`
  },
  {
    id: 'promoteHorde',
    content: `Share the love! Help spread the word about the AI Horde and ArtBot by sharing images you've generated on Reddit, Mastodon or wherever you consume your favorite internet content.`
  }
]

export const getRandomTip = () => {
  const apikey = AppSettings.get('apiKey')
  const kudos = userInfoStore.state.kudos

  const randomIndex = Math.floor(Math.random() * tips.length)
  const tip = tips[randomIndex]

  console.log(`errr kudos??`, kudos)

  if (tip.id === 'worker' && (kudos < 5 || kudos > 50)) {
    return false
  }

  if (tip.id === 'apikey' && apikey) {
    return false
  }

  return tips[randomIndex]
}

export default tips
