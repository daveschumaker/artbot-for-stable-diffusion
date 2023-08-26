interface Preset {
  [key: string]: {
    cfg_scale?: number
    height?: number
    loras?: Array<{
      name: string
      inject_trigger?: string
      model?: number
      clip?: number
    }>
    model?: string
    prompt: string
    sampler_name?: string
    steps?: number
    width?: number
  }
}

function sortAlphabetically(obj: any) {
  const sortedKeys = Object.keys(obj).sort()
  const sortedObj: any = {}

  for (const key of sortedKeys) {
    sortedObj[key] = obj[key]
  }

  return sortedObj
}

// Via: https://github.com/Haidra-Org/AI-Horde-Styles
// TODO: Automatically import and update
export const stableHordeStyles: Preset = {
  sdxl: {
    prompt: '{p}{np}',
    model: 'SDXL_beta::stability.ai#6901',
    width: 1024,
    height: 1024,
    steps: 50
  },
  raw: {
    prompt: '{p}{np}',
    model: 'stable_diffusion'
  },
  raw2: {
    prompt: '{p}{np}',
    model: 'stable_diffusion_2.1',
    sampler_name: 'dpmsolver',
    width: 768,
    height: 768
  },
  rpiracy: {
    prompt:
      'Masterpiece, splash art, digital painting, a full body shot of a sexy male pirate (John Oliver:1.3) in pirate captain clothes {p}, glasses, global illumination, hot, art by artgerm and paul cadmus, and viktoria gavrilenko###{np}woman, fully dressed, blurry, bad drawing, double head, blurry, ugly, deformed, malformed, lowres, mutant, mutated, disfigured, compressed, noise, artifacts, dithering, simple, watermark, text, font, signage, collage, pixel',
    model: 'Dreamshaper',
    sampler_name: 'k_dpm_adaptive',
    steps: 43,
    cfg_scale: 8.5
  },
  sdxlcatgirlportrait: {
    prompt:
      'high quality, intricate, fluffy tail, cat ears, a full-body portrait of a catgirl, {p}, photorealistic, magical realism, fantasy###{np}, (Drawing cartoon comic sketch 2d render:0.7)',
    model: 'SDXL_beta::stability.ai#6901',
    sampler_name: 'k_dpmpp_sde',
    width: 832,
    height: 1152,
    steps: 50,
    cfg_scale: 8.5
  },
  sovietpropaganda: {
    prompt:
      'USSR soviet propaganda poster, {p}###photorealistic, cute, modern,{np}',
    model: 'SDXL_beta::stability.ai#6901',
    sampler_name: 'k_dpmpp_sde',
    width: 768,
    height: 1152,
    steps: 50,
    cfg_scale: 8.5
  },
  embroidery: {
    prompt:
      '(Embroidery) knitting pattern of {p}, (cross stitch)###photorealistic, {np}',
    model: 'SDXL_beta::stability.ai#6901',
    sampler_name: 'k_dpmpp_sde',
    width: 1024,
    height: 1024,
    steps: 50,
    cfg_scale: 8.5
  },
  broadsheetart: {
    prompt: 'antique broadsheet drawing, {p}, text, monotone###{np}, colorful',
    model: 'SDXL_beta::stability.ai#6901',
    sampler_name: 'k_dpmpp_sde',
    width: 1024,
    height: 1024,
    steps: 50,
    cfg_scale: 8.5
  },
  watercolorscenery: {
    prompt:
      'watercolor painting of {p}, broad brush strokes, soft colors###photorealistic, 3d, {np}',
    model: 'SDXL_beta::stability.ai#6901',
    sampler_name: 'k_dpmpp_sde',
    width: 1344,
    height: 832,
    steps: 40,
    cfg_scale: 7.5
  },
  pencilscribbles: {
    prompt:
      '`Scribbled random lines, shape of {p}, pencil scribbles sketch###solid outlines, color, fill, 3d, {np}',
    model: 'SDXL_beta::stability.ai#6901',
    sampler_name: 'k_dpmpp_sde',
    width: 1024,
    height: 1024,
    steps: 50,
    cfg_scale: 8.5
  },
  sdxlchibis: {
    prompt:
      'high quality, a chibi {p}, blindbox style, 3dcute, 3dcutecharacter, 3d, cute###{np}, (Drawing cartoon comic sketch 2d:0.6), spritesheet, multiple angles',
    model: 'SDXL_beta::stability.ai#6901',
    sampler_name: 'k_dpmpp_sde',
    width: 1024,
    height: 1024,
    steps: 45,
    cfg_scale: 8
  },
  sdxlstreetfashion: {
    prompt:
      'high quality, intricate, (fashionable clothes, street fashion:1.2), a full-body portrait of a fashionable {p}, attractive, photorealistic, magical realism, fantasy###{np}, (Drawing cartoon comic sketch 2d render, sexy:0.7)',
    model: 'SDXL_beta::stability.ai#6901',
    sampler_name: 'k_dpmpp_sde',
    width: 832,
    height: 1152,
    steps: 50,
    cfg_scale: 8.5
  },
  sdxlhorror: {
    prompt:
      'nighmare horror trypophobia odontophobia thalassophobia disgusting nasty ugly bloody terror, {p}###{np}, attractive, sexy',
    model: 'SDXL_beta::stability.ai#6901',
    sampler_name: 'k_dpmpp_sde',
    width: 1024,
    height: 1024,
    steps: 50,
    cfg_scale: 8.5
  },
  glitchart: {
    prompt:
      '{p}###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    width: 512,
    height: 640,
    loras: [{ name: '71125', inject_trigger: 'any' }]
  },
  oldvhs: {
    prompt:
      'old vhs footage of {p}, distortion, glitch###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    width: 512,
    height: 640,
    loras: [{ name: '103667' }]
  },
  pixelsorting: {
    prompt:
      '{p}###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    width: 512,
    height: 640,
    loras: [{ name: '57963', inject_trigger: 'any' }]
  },
  analogdistortion: {
    prompt:
      'AnalogDistortion, Analog Photo of {p}###{np}, worst quality, EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, Humpbacked, disfigured, mutation, mutated, extra limb, ugly, missing limb, floating limbs, disconnected limbs, malformed hands, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    width: 512,
    height: 640,
    loras: [{ name: '104917' }]
  },
  gothichorrorai: {
    prompt:
      '{p}###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '39760', inject_trigger: 'any' }]
  },
  tentaclehorrorai: {
    prompt:
      '{p}###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '42468', inject_trigger: 'any' }]
  },
  reelhorror: {
    prompt:
      'portrait of {p}, reelhorror, blood, dripping, mutation, mouthface, trash, pov, pov scene, extra eyes###{np}, cropped, out of focus, monochrome, symbol, text, logo, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '67666' }]
  },
  bodyhorror: {
    prompt:
      '{p}###{np}, cropped, out of focus, monochrome, symbol, text, logo, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '51288',
        model: 0.8,
        clip: 1,
        inject_trigger: 'body horror, mutation, blood'
      }
    ]
  },
  nastyhorrors: {
    prompt:
      '{p}, body horror, mutation, blood, reelhorror, dripping, trash###{np}, cropped, out of focus, monochrome, symbol, text, logo, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '51288',
        model: 0.7,
        clip: 1,
        inject_trigger: 'body horror, mutation, blood'
      },
      { name: '67666', model: 0.7, clip: 1 }
    ]
  },
  ivorygoldai: {
    prompt:
      '{p}###{np}, cropped, out of focus, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '62700', inject_trigger: 'any' }]
  },
  arielphorror: {
    prompt:
      '{p}, arielpstyle, dark horror, creepy creepy-looking, painting, lovecraftian, grease, painting \\(medium\\), drawing, brush stroke###{np}, cropped, out of focus, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Lyriel',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '39760' }]
  },
  dreadhorror: {
    prompt:
      '{p}, Dread, horror, nightmare###{np}, cropped, out of focus, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Deliberate',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '98011' }]
  },
  piratepunk: {
    prompt:
      '{p}, piratepunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '45892' }]
  },
  lunarpunk: {
    prompt:
      '{p}###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '97136', inject_trigger: 'any' }]
  },
  celtpunk: {
    prompt:
      '{p}###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '92008', inject_trigger: 'any' }]
  },
  toxicpunk: {
    prompt:
      '{p}###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '95802', inject_trigger: 'any' }]
  },
  mongolpunk: {
    prompt:
      '{p}###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '85109', inject_trigger: 'any' }]
  },
  musketpunk: {
    prompt:
      '{p}###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '90543', inject_trigger: 'any' }]
  },
  absinthepunk: {
    prompt:
      '{p}###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '89183', inject_trigger: 'any' }]
  },
  cattlepunk: {
    prompt:
      '{p}###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '95828', inject_trigger: 'any' }]
  },
  circuspunk: {
    prompt:
      '{p}###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '87884', inject_trigger: 'any' }]
  },
  aetherpunk: {
    prompt:
      '{p}###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '85036', inject_trigger: 'any' }]
  },
  potatopunk: {
    prompt:
      '{p}###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '72231', inject_trigger: 'any' }]
  },
  coalpunk: {
    prompt:
      '{p}, coalpunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '84753' }]
  },
  alchemypunk: {
    prompt:
      '{p}, alchemypunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '78766' }]
  },
  gothicpunk: {
    prompt:
      '{p}, gothicpunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '78695' }]
  },
  witchpunk: {
    prompt:
      '{p}, WitchcraftPunkAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '78280' }]
  },
  colorpunk: {
    prompt:
      '{p}, PunkPunkAI, colorful###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '78060' }]
  },
  bronzepunk: {
    prompt:
      '{p}, bronzepunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '77293' }]
  },
  neonpunk: {
    prompt:
      '{p}, CyberpunkAI, neon###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '77121' }]
  },
  kazakpunk: {
    prompt:
      '{p}, kazakpunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '76737' }]
  },
  grecopunk: {
    prompt:
      '{p}, grecopunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '76190' }]
  },
  romanpunk: {
    prompt:
      '{p}, romapunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '76190' }]
  },
  sovietpunk: {
    prompt:
      '{p}, sovietpunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '75709' }]
  },
  arabiannightspunk: {
    prompt:
      '{p}, 1001ArabianNights###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '69315' }]
  },
  steampunk: {
    prompt:
      '{p}, SteampunkAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '59338' }]
  },
  cogpunk: {
    prompt:
      '{p}, CogPunkAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '59338' }]
  },
  victorianpunk: {
    prompt:
      '{p}, VictorianPunkAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '84250' }]
  },
  biopunk: {
    prompt:
      '{p}, BiopunkAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '80375' }]
  },
  mahabharatapunk: {
    prompt:
      '{p}, MahabharataPunkAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '71478' }]
  },
  javapunk: {
    prompt:
      '{p}, javapunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '72415' }]
  },
  balipunk: {
    prompt:
      '{p}, balipunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '72347' }]
  },
  dieselpunk: {
    prompt:
      '{p}, dieselpunkAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '64676' }]
  },
  totempunk: {
    prompt:
      '{p}, TotempunkAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '71819' }]
  },
  samuraipunk: {
    prompt:
      '{p}, SamuraiPunkAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '69108' }]
  },
  zulupunk: {
    prompt:
      '{p}, zulupunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '65725' }]
  },
  teslapunk: {
    prompt:
      '{p}, teslapunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '64955' }]
  },
  valvepunk: {
    prompt:
      '{p}, valvepunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '64955' }]
  },
  infernalpunk: {
    prompt:
      '{p}, 1nf3rnalAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '62585' }]
  },
  solarpunk: {
    prompt:
      '{p}, solarpunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '43944' }]
  },
  stonepunk: {
    prompt:
      '{p}, stonepunkAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '51539' }]
  },
  gempunk: {
    prompt:
      '{p}, GemstoneAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '49374' }]
  },
  horrorpunk: {
    prompt:
      '{p}, ManyEyedHorrorAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '47489' }]
  },
  bonepunk: {
    prompt:
      '{p}, BoneyardAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '48356' }]
  },
  oldegyptpunk: {
    prompt:
      '{p}, OldEgyptAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '43229' }]
  },
  vikingpunk: {
    prompt:
      '{p}, vikingpunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '41364' }]
  },
  gaslamppunk: {
    prompt:
      '{p}, GasLampFantasyAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '71335' }]
  },
  atompunk: {
    prompt:
      '{p}, 1970retrofuturism###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '64235' }]
  },
  gothpunk: {
    prompt:
      '{p}, PastelGothAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '75265' }]
  },
  circuitpunk: {
    prompt:
      '{p}, CircuitBoardAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '58410' }]
  },
  nightmarepunk: {
    prompt:
      '{p}, NightmarishAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '56336' }]
  },
  crystalpunk: {
    prompt:
      '{p}, crystallineAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '48859' }]
  },
  fantasypunk: {
    prompt:
      '{p}, fairytaleai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [{ name: '42260' }]
  },
  'perfect summer': {
    prompt:
      'digital art, cg painting, (medium long shot:1.2), hyper detailed, volumetric lighting, godrays, realistic, photorealistic render, golden hour, sun-drenched panorama, lush tropical colors, subtle shading, {p}, beautiful face, wide glossy eyes, ultra detailed, masterpiece, high resolution illustration, 4k, centered composition###nsfw, lowres, text, error, cropped, out of frame, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, out of focus, censorship, ugly, black and white, monochrome, artist name, signature, multiple views, power lines{np}',
    model: 'Perfect World',
    steps: 50,
    cfg_scale: 9
  },
  'vintage postcard': {
    prompt:
      'vintage tourism postcard, portraying (giant:0.99) {p} in random pose and enjoying fun outdoor activities, at urban amusement park, in the year 1900. (closeup shot), detailed, watercolor and sharp pencil, printed on weathered paper with thin border. (ice cream, fried foods, beachside, Coney Island:0.9)###out of frame, cut off, ugly, blurry, deformed hands, deformed face, poorly drawn face, disfigured, low quality, mutilated, mangled, winter, far away,{np}',
    model: 'Dreamshaper',
    width: 640,
    steps: 30,
    cfg_scale: 10
  },
  'sunny day': {
    prompt:
      'studio ghibli, Joaquín Sorolla, realistic 90s anime illustration of {p}, clear sunny day, warm tones and shades, variations in tone and texture, harsh shadows, harsh lighting, pastel colors, heatwaves in air{np}',
    model: 'Realistic Vision'
  },
  'golden light': {
    prompt: 'A highres photo of {p}, summer vibes, warm light, golden tint{np}',
    model: 'Deliberate'
  },
  backstage: {
    prompt:
      'behind the scenes footage from the set of {p}, movie set, breakdown, dramatic lighting, off centered focus, clear wide shot, dreamlikeart###blurry, distorted, ugly faces,{np}',
    model: 'Dreamlike Diffusion'
  },
  'generic scifi': {
    prompt:
      '{p}, science fiction artwork, epic, detailed and intricate digital concept art, by John Jude Palencar, Manchu, and Devin Elle Kurtz, 4K{np}',
    model: 'stable_diffusion'
  },
  'high fantasy': {
    prompt:
      '{p}, fantasy artwork, epic, detailed and intricate digital painting, trending on artstation, by wlop and greg rutkowski, octane render{np}',
    model: 'stable_diffusion'
  },
  '19th century painting': {
    prompt:
      'digitized painting of a {p}, highly detailed, sharp focus, impasto brush strokes, acclaimed artwork by gaston bussiere, by j. c. leyendecker{np}',
    model: 'stable_diffusion'
  },
  butter: {
    prompt:
      '{p} as award-winning butter sculpture at the Minnesota State Fair, made of butter, dairy creation{np}',
    model: 'stable_diffusion'
  },
  'terror ink': {
    prompt:
      'a terrifying ink drawing of a {p}, by Ko Young Hoon, by Yoshitaka Amano, Charcoal Art, Ink, Oil Paint, Concept Art, Color Grading, Dramatic, Intentional camera movement, Lonely, Cracks, With Imperfections, in a symbolic and meaningful style, insanely detailed and intricate, hypermaximalist, elegant, ornate, hyper realistic, super detailed, a ghost, covered in spiderweb, eerie, feeling of dread, decay, samhain{np}',
    model: 'stable_diffusion'
  },
  nightmare: {
    prompt:
      '{p} by Aaron Horkey, by Adonna Khare, by Carrie Ann Baade, by Jeff Lemire, by Junji Ito, horror, creepy, dark, eldritch, fantasy{np}',
    model: 'stable_diffusion'
  },
  abandoned: {
    prompt:
      'Old found footage of hyper realistic {p}, abandoned, liminal space, horror, eerie, mysterious, noise and grain, dark hues, dark tones, single source of light, 35mm, Kodak Autochrome, floating particles, auto flash, auto focus###blurry, out of focus{np}',
    model: 'stable_diffusion_2.1',
    sampler_name: 'dpmsolver',
    width: 768,
    height: 768
  },
  'witch land': {
    prompt:
      'digital art of {p}, witch world, Halloween theme, scenic Halloween, highly detailed, zbrush, by artist Artgerm, by artist Stephen Hickman, by artist Carne griffiths{np}',
    model: 'stable_diffusion'
  },
  'nightmare fairytale': {
    prompt:
      'horror {p} in a dark forest, darkness, fog, very detailed, cold, Editorial illustration, gothic, evil, art by Sam Bosma, painting by H.P. Lovecraft{np}',
    model: 'stable_diffusion'
  },
  elmstreet: {
    prompt:
      'drawing of {p} by tim burton, by Aaron Horkey, by H R Giger, creepy, horror, sharp, focused, HD, detailed{np}',
    model: 'stable_diffusion'
  },
  ennui: {
    prompt: '{p}, black and white, foggy, negative, eerie{np}',
    model: 'stable_diffusion_2.1',
    sampler_name: 'dpmsolver',
    width: 768,
    height: 768
  },
  'dark fantasy': {
    prompt:
      'highly detailed digital painting of {p}, highly realistic fantasy concept art by Darek Zabrocki and Zdzisław Beksiński, paint strokes, intricate, eerie scenery, dark volumetric lighting, triadic color scheme, very coherent, sharp focus, illustration, film grain, spooky vibe{np}',
    model: 'stable_diffusion'
  },
  'frozen village': {
    prompt:
      '{p} close to anime village in a vast rural frozen hilly landscape, mountains, anime, makoto shinkai{np}',
    model: 'stable_diffusion'
  },
  culdesac: {
    prompt:
      'a beautiful oil painting of a {p} in a closeup groundup perspective of a culdesac of modern houses in winter, epic composition, rural, snowy village, by studio ghibli and rossdraws{np}',
    model: 'stable_diffusion'
  },
  snowing: {
    prompt:
      '{p} as an anime movie background matte painting of a snowing meadow in the countryside in winter, rolling hills, cottages, fields, christmas, by Makoto Shinkai, trending on artstation, highly detailed ### summer,{np}',
    model: 'stable_diffusion'
  },
  'wintersun temple': {
    prompt:
      'elden ring style {p}, in a snow landscape with a japanese temple at the background, epic middle of a storm, wintersun cover, showing every detail of each snowflake in unreal engine 5, bright, dramatic light, cinematic luminous golden hour, lifey landscape, beautiful, vibrant, abandoned overgrown seas ###lowres, text, error, cropped, worst quality, jpeg artifacts, signature, watermark, deformed, frames,{np}',
    model: 'stable_diffusion_2.1',
    sampler_name: 'dpmsolver',
    width: 768,
    height: 768
  },
  'fantasy snowstorm': {
    prompt:
      '{p} in a fantasy snowstorm, snowflakes,8k,highly detailed,a cozy village,sun behind clouds, masterpiece,art by WLOP ### out of frame,lowres, text, error, cropped, bad quality, jpeg artifacts, signature, watermark, deformed, ugly, unsightly,{np}',
    model: 'stable_diffusion'
  },
  'christmas church': {
    prompt:
      '{p} next to a church with christmas lights, snowy weather, village on side of mountain, swiss alps, pixar render, unreal 5, uhd, 8k, landscape, panorama{np}',
    model: 'stable_diffusion_2.1',
    sampler_name: 'dpmsolver',
    width: 768,
    height: 768
  },
  'log cabin': {
    prompt:
      'concept art oil painting of a {p} next to a christmas log cabin by a river, extremely detailed, brush hard, fantasy by jama jurabaev, Paul Lehr, masterpiece, award winning, trending on artstation{np}',
    model: 'stable_diffusion_2.1',
    sampler_name: 'dpmsolver',
    width: 768,
    height: 768
  },
  'prehistoric winter': {
    prompt:
      'epic {p} iced snow landscape battles in prehistory, vasteness, Albert Bierstadt, valleys, luminous golden hour, lifey landscape, beautiful, vibrant, abandoned overgrown mountains ###lowres, text, error, cropped, worst quality, jpeg artifacts, signature, watermark, deformed, {np}',
    model: 'stable_diffusion_2.1',
    sampler_name: 'dpmsolver',
    width: 768,
    height: 768
  },
  'warrior fairy': {
    prompt:
      'beautiful warrior fairy {p}, portrait, up close, cinematic, snowy background, dramatic lighting, highly detailed, very intricate, meta, fanciful, optimistic, wide shot, volumetric lighting, bokeh blur, unreal engine, octane render ### deformed, ugly, mutated, watermark, trademark, border, nude, NSFW, {np}',
    model: 'stable_diffusion'
  },
  anything: {
    prompt:
      '{p}, shadows, lights, outline, highly detailed###cropped, artifacts, lowres, {np}',
    model: 'Anything Diffusion'
  },
  anything_raw: {
    prompt: '{p}{np}',
    model: 'Anything Diffusion'
  },
  waifu: {
    prompt:
      '{p}, shadows, lights, outline, highly detailed###cropped, artifacts, lowres, {np}',
    model: 'waifu_diffusion'
  },
  waifu_raw: {
    prompt: '{p}{np}',
    model: 'waifu_diffusion'
  },
  trinart: {
    prompt:
      '{p}, shadows, lights, outline, highly detailed###cropped, artifacts, lowres, {np}',
    model: 'trinart'
  },
  trinart_raw: {
    prompt: '{p}{np}',
    model: 'trinart'
  },
  hentai: {
    prompt:
      '{p}, shadows, lights, outline, highly detailed, anime###cropped, artifacts, lowres, {np}',
    model: 'Hentai Diffusion'
  },
  hentai_raw: {
    prompt: '{p}{np}',
    model: 'Hentai Diffusion'
  },
  poison: {
    prompt:
      '{p}, shadows, lights, outline, highly detailed, anime###cropped, artifacts, lowres, {np}',
    model: 'Poison'
  },
  poison_raw: {
    prompt: '{p}{np}',
    model: 'Poison'
  },
  eimis: {
    prompt:
      '{p}, shadows, lights, outline, highly detailed, anime###cropped, artifacts, lowres, {np}',
    model: 'Eimis Anime Diffusion'
  },
  eimis_raw: {
    prompt: '{p}{np}',
    model: 'Eimis Anime Diffusion'
  },
  acertainthing: {
    prompt:
      '{p}, shadows, lights, outline, highly detailed, anime###cropped, artifacts, lowres, {np}',
    model: 'ACertainThing'
  },
  acertainthing_raw: {
    prompt: '{p}{np}',
    model: 'ACertainThing'
  },
  scalie: {
    prompt:
      'e621, highly detailed fullbody of a fully clothed solo scalie {p}, detailed scales, volumetric lighting, looking at viewer, by Michael & Inessa Garmash and  Ruan Jia and Ross Tran and Pino Daeni###cropped, artifacts, lowres###crosseyed, human, human skin, human head, human hands, human face, three hands, three feet, three arms, three legs, text bubble, no pupils, simple background, bad anatomy, deformed face, undefined, incomplete, uncertain, smudge, melt, smear, disproportional, disfigured, deformed, malformed, mutant, monstrous, ugly, gross, disgusting, blurry, poorly drawn, extra limbs, extra fingers, missing limbs, amputee, malformed hands, genitals, breasts, naked, dialogue, text, feral, {np}',
    model: 'Yiffy'
  },
  furry: {
    prompt:
      'e621, highly detailed fullbody of a fully clothed solo anthro {p}, pants, detailed fluffy fur, fluffy tail, volumetric lighting, looking at viewer, by Michael & Inessa Garmash and  Ruan Jia and Ross Tran and Pino Daeni###cropped, artifacts, lowres###crosseyed, human, human skin, human head, human hands, human face, three hands, three feet, three arms, three legs, text bubble, no pupils, simple background, bad anatomy, deformed face, undefined, incomplete, uncertain, smudge, melt, smear, disproportional, disfigured, deformed, malformed, mutant, monstrous, ugly, gross, disgusting, blurry, poorly drawn, extra limbs, extra fingers, missing limbs, amputee, malformed hands, genitals, breasts, naked, dialogue, text, feral, {np}',
    model: 'Yiffy'
  },
  'impasto furry': {
    prompt:
      '{p}anthro, female, detailed fluffy fur, impasto impressionism, by Leonid Afremov , Gil Elvgren, Sophie Anderson, extreme detail, detailed pupils, shining fur, pattern, hair highlight, transparent hair, fur###deformed, blurry, bad anatomy, disfigured, poorly drawn face, mutation, mutated, extra limb, ugly, horror, out of focus, depth of field, focal blur, explict, baby, mark, watermark, sign, logo, signature, genitals {np}',
    model: 'Yiffy'
  },
  yiffy: {
    prompt: '{p}{np}',
    model: 'Yiffy'
  },
  seekart: {
    prompt: '{p}{np}',
    model: 'Seek.art MEGA'
  },
  hassanblend: {
    prompt: '{p}{np}',
    model: 'Hassanblend'
  },
  'rpg portrait': {
    prompt: '{p}{np}',
    model: 'RPG'
  },
  arcane: {
    prompt: '{p}, arcane style{np}',
    model: 'Nitro Diffusion'
  },
  'spider verse': {
    prompt: '{p}, spiderverse style{np}',
    model: 'Spider-Verse Diffusion'
  },
  archer: {
    prompt: '{p}, archer style{np}',
    model: 'Nitro Diffusion'
  },
  'elden ring': {
    prompt: '{p}, elden ring style{np}',
    model: 'Elden Ring Diffusion'
  },
  robo: {
    prompt: '{p}, nousr robot{np}',
    model: 'Robo-Diffusion'
  },
  'modern animation': {
    prompt: '{p}, modern disney style{np}',
    model: 'Nitro Diffusion'
  },
  'classic animation': {
    prompt: '{p}, classic disney style{np}',
    model: 'Classic Animation Diffusion'
  },
  xynthii: {
    prompt: '{p}, xynthii{np}',
    model: 'Xynthii-Diffusion'
  },
  'comic mashup': {
    prompt:
      '{p}, charliebo artsyle, holliemengert artstyle, pepelarraz artstyle, andreasrocha artstyle, jamesdaly artstyle{np}',
    model: 'Comic-Diffusion'
  },
  'charlie bo': {
    prompt: '{p}, charliebo artsyle{np}',
    model: 'Comic-Diffusion'
  },
  'hollie mengert': {
    prompt: '{p}, holliemengert artstyle{np}',
    model: 'Comic-Diffusion'
  },
  'pepe larraz': {
    prompt: '{p}, pepelarraz artstyle{np}',
    model: 'Comic-Diffusion'
  },
  'andreas rocha': {
    prompt: '{p}, andreasrocha artstyle{np}',
    model: 'Comic-Diffusion'
  },
  'james daly': {
    prompt: '{p}, jamesdaly artstyle{np}',
    model: 'Comic-Diffusion'
  },
  'tron legacy': {
    prompt: '{p}, trnlgcy{np}',
    model: 'Tron Legacy Diffusion'
  },
  microworlds: {
    prompt: '{p}, microworld render style{np}',
    model: 'Microworlds'
  },
  redshift: {
    prompt: '{p}, redshift style{np}',
    model: 'Redshift Diffusion'
  },
  borderlands: {
    prompt: '{p}, borderlands{np}',
    model: 'Borderlands'
  },
  'cyberpunk edgerunners': {
    prompt: '{p}, dgs{np}',
    model: 'Cyberpunk Anime Diffusion'
  },
  'cyberpunk anime': {
    prompt: '{p}, illustration style{np}',
    model: 'Cyberpunk Anime Diffusion'
  },
  midjourney: {
    prompt: '{p}, midjrny-v4 style{np}',
    model: 'Midjourney Diffusion'
  },
  'pixel sprite': {
    prompt: '{p}, pixel sprite{np}',
    model: 'AIO Pixel Art'
  },
  '16bit scene': {
    prompt: '{p}, 16bitscene{np}',
    model: 'AIO Pixel Art'
  },
  voxel: {
    prompt: '{p}, VoxelArt{np}',
    model: 'Voxel Art Diffusion'
  },
  'van gogh': {
    prompt: '{p}, lvngvncnt{np}',
    model: 'Van Gogh Diffusion'
  },
  bubblydubbly: {
    prompt: '{p}, art by bubblydubbly{np}',
    model: 'BubblyDubbly'
  },
  clazy: {
    prompt: '{p}, clazy style{np}',
    model: 'Clazy'
  },
  samdoesarts: {
    prompt: '{p}, samdoesarts style{np}',
    model: 'Samdoesarts Ultmerge'
  },
  synthwave: {
    prompt: '{p}, snthwve style{np}',
    model: 'Synthwave'
  },
  vectorartz: {
    prompt: '{p}, vectorartz{np}',
    model: 'vectorartz'
  },
  ranma: {
    prompt: '{p}, 80sanimestyle{np}',
    model: 'Ranma Diffusion'
  },
  guohua: {
    prompt: '{p}, guohua style{np}',
    model: 'Guohua Diffusion'
  },
  inkpunk: {
    prompt: '{p}, nvinkpunk{np}',
    model: 'Inkpunk Diffusion'
  },
  'inkpunk+': {
    prompt:
      '{p}, insanely detailed and intricate, hyper maximalist, elegant, hyper realistic, super detailed, 8K, vivid colors, sunrise, open sky, ultra-realistic, nature photography, photographic rendering, realistic textures, color dynamic, octane render, cinematic lighting, enhance, soft light beam, perfect face, rule of thirds, nvinkpunk{np}',
    model: 'Inkpunk Diffusion'
  },
  mtg: {
    prompt: '{p}, mtg card art{np}',
    model: 'Fantasy Card Diffusion'
  },
  knollingcase: {
    prompt: '{p}, knollingcase{np}',
    model: 'Knollingcase'
  },
  paintart: {
    prompt: '{p}, mdjrny-pntrt{np}',
    model: 'Midjourney PaintArt'
  },
  ghibli: {
    prompt: '{p}, ghibli style{np}',
    model: 'Ghibli Diffusion'
  },
  wavyfusion: {
    prompt: '{p}, wa-vy style{np}',
    model: 'Wavyfusion'
  },
  papercutcraft: {
    prompt: '{p}, papercutcraft style{np}',
    model: 'Papercutcraft'
  },
  papercut: {
    prompt: '{p}, PaperCut{np}',
    model: 'Papercut Diffusion'
  },
  chroma: {
    prompt:
      '{p}, ChromaV5 award winning photography, extremely detailed, artstation, 8 k, incredible art{np}',
    model: 'ChromaV5'
  },
  kurzgesagt: {
    prompt: '{p}, kurzgesagt style{np}',
    model: 'kurzgesagt'
  },
  squishmallow: {
    prompt: '{p}, Squishmallow{np}',
    model: 'Squishmallow Diffusion'
  },
  dreamlike: {
    prompt: '{p}, dreamlikeart{np}',
    model: 'Dreamlike Diffusion'
  },
  analog: {
    prompt: '{p}, analog style{np}',
    model: 'Analog Diffusion'
  },
  simpsons: {
    prompt: '{p}, asim style{np}',
    model: 'Asim Simpsons'
  },
  funko: {
    prompt: '{p}, funko style{np}',
    model: 'Funko Diffusion'
  },
  dublex: {
    prompt: '{p}, dublex{np}',
    model: 'Double Exposure Diffusion'
  },
  balloon: {
    prompt: '{p}, BalloonArt{np}',
    model: 'Balloon Art'
  },
  future: {
    prompt: '{p}, future style{np}',
    model: 'Future Diffusion'
  },
  valorant: {
    prompt: '{p}, valorant style{np}',
    model: 'Valorant Diffusion'
  },
  gta5: {
    prompt: '{p}, gtav style{np}',
    model: 'GTA5 Artwork Diffusion'
  },
  appicon: {
    prompt: '{p}, IconsMi{np}',
    model: 'App Icon Diffusion'
  },
  space: {
    prompt: '{p}, jwst{np}',
    model: 'JWST Deep Space Diffusion'
  },
  dnd: {
    prompt: '{p}{np}',
    model: 'Dungeons and Diffusion'
  },
  microscopic: {
    prompt: '{p}, microscopic{np}',
    model: 'Microscopic'
  },
  trinart_character_raw: {
    prompt: '{p}{np}',
    model: 'Trinart Characters'
  },
  smoke: {
    prompt: '{p}, ssmoky{np}',
    model: 'Smoke Diffusion'
  },
  supermarionation: {
    prompt: '{p}, supermarionation{np}',
    model: 'Supermarionation'
  },
  'dreamlike photoreal': {
    prompt: '{p}{np}',
    model: 'Dreamlike Photoreal'
  },
  portraitplus: {
    prompt: '{p}, portrait+ style{np}',
    model: 'PortraitPlus'
  },
  vintedois: {
    prompt: '{p}, estilovintedois{np}',
    model: 'Vintedois Diffusion'
  },
  darkest: {
    prompt: '{p}, in the artstyle of dd{np}',
    model: 'Darkest Diffusion'
  },
  eternos: {
    prompt: '{p}, romerorzeternos{np}',
    model: 'Eternos'
  },
  'background illustration': {
    prompt: '{p}, sjh style{np}',
    model: 'Min Illust Background'
  },
  'dark victorian': {
    prompt: '{p}, darkvictorian artstyle{np}',
    model: 'Dark Victorian Diffusion'
  },
  'dnd item': {
    prompt: '{p}, dnditem{np}',
    model: 'DnD Item'
  },
  'modern art': {
    prompt: '{p}, modernartst{np}',
    model: 'ModernArt Diffusion'
  },
  hasdx: {
    prompt: '{p}{np}',
    model: 'HASDX'
  },
  protogen: {
    prompt: '{p}{np}',
    model: 'ProtoGen'
  },
  '3dkx': {
    prompt: '{p}{np}',
    model: '3DKX'
  },
  moedel: {
    prompt: '{p}{np}',
    model: 'Moedel'
  },
  dreamlikesam: {
    prompt: '{p}, samdoesart{np}',
    model: 'DreamLikeSamKuvshinov'
  },
  dreamlikekuvshinov: {
    prompt: '{p}, Kuvshinov{np}',
    model: 'DreamLikeSamKuvshinov'
  },
  dreamlikeart: {
    prompt: '{p}, dreamlikeart{np}',
    model: 'DreamLikeSamKuvshinov'
  },
  'sygil-dev': {
    prompt: '{p}{np}',
    model: 'Sygil-Dev Diffusion'
  },
  moistmix: {
    prompt: '{p}{np}',
    model: 'MoistMix'
  },
  'healys anime': {
    prompt: '{p}{np}',
    model: "Healy's Anime Blend"
  },
  'lucid mix': {
    prompt: '{p}{np}',
    model: "Elldreth's Lucid Mix"
  },
  'sci-fi': {
    prompt: '{p}{np}',
    model: 'Sci-Fi Diffusion'
  },
  ultraskin: {
    prompt: '{p}, ultraskin{np}',
    model: 'Ultraskin'
  },
  sonic: {
    prompt: '{p}, mobian{np}',
    model: 'Sonic Diffusion'
  },
  ppp: {
    prompt: '{p}{np}',
    model: 'PPP'
  },
  anygen: {
    prompt: '{p}{np}',
    model: 'Anygen'
  },
  'sci-fi protogen': {
    prompt: '{p}{np}',
    model: 'Protogen Infinity'
  },
  duchaiten: {
    prompt: '{p}{np}',
    model: 'DucHaiten'
  },
  dreamshaper: {
    prompt: '{p}{np}',
    model: 'Dreamshaper'
  },
  'zelda botw': {
    prompt: '{p}, botw style{np}',
    model: 'Zelda BOTW'
  },
  marvel: {
    prompt: '{p}, whatif style{np}',
    model: 'Marvel Diffusion'
  },
  't-shirt': {
    prompt: '{p}, as a t-shirt logo in the style of <MAGIFACTORY> art{np}',
    model: 'T-Shirt Diffusion'
  }
}

// Random stuff I've found on Reddit that seems interesting.
// TODO: Backfeed these into main Stable Horde styles.
const customStyles = {}

export const stylePresets = sortAlphabetically({
  ...stableHordeStyles,
  ...customStyles
})
