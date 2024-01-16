import { HordePreset } from '_types/horde'

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
export const stableHordeStyles: { [key: string]: HordePreset } = {
  sdxl: {
    prompt: '{p}{np}',
    model: 'SDXL 1.0',
    steps: 8,
    width: 1024,
    height: 1024,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  albedo: {
    prompt: '{p}{np}',
    model: 'AlbedoBase XL (SDXL)',
    steps: 8,
    width: 1024,
    height: 1024,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
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
  'bd-ai': {
    prompt:
      'An robotic (artificial intelligence:1.1) {p}, birthday theme, (the words "1 year":1.35), science fiction{np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 1024,
    height: 1024,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  'makoto birthday': {
    prompt:
      '{p}, (manga artwork:1.1), drawn by Makoto Shinkai, (birthday theme:1.3)###{np}, colorful,realistic, render, 3d, photographic',
    model: 'AlbedoBase XL (SDXL)',
    width: 1024,
    height: 1024,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  'artistic birthday': {
    prompt:
      '(Birthday-themed:1.3), {p}, art by Sophie Anderson and Guy Denning and Lisa Frank###{np}, boring, bw, loli, teen',
    model: 'AlbedoBase XL (SDXL)',
    width: 1024,
    height: 1024,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  bdcolordd: {
    prompt: '{p}, happy birthday, colorful, in the style of t3xtn{np}',
    model: 'Dreamshaper',
    width: 960,
    height: 768,
    hires_fix: true,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '268475',
        model: 1,
        is_version: true
      },
      {
        name: '85479',
        model: 0.5
      },
      {
        name: '42190',
        model: 0.85
      },
      {
        name: '109775',
        model: 0.2
      },
      {
        name: '22437',
        model: 0.85
      }
    ]
  },
  'sdxl-vertical': {
    prompt: '{p}{np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 704,
    height: 1472,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  'sdxl-extreme-vertical': {
    prompt: '{p}{np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 640,
    height: 1536,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  'sdxl-portrait': {
    prompt: '{p}{np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 832,
    height: 1216,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  'sdxl-photo': {
    prompt: '{p}{np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 896,
    height: 1152,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  'sdxl-photo-horizontal': {
    prompt: '{p}{np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 1152,
    height: 896,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  'sdxl-landscape': {
    prompt: '{p}{np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 1280,
    height: 832,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  'sdxl-widescreen': {
    prompt: '{p}{np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 1344,
    height: 768,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  'sdxl-cinematic': {
    prompt: '{p}{np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 1536,
    height: 640,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  graffiti: {
    prompt:
      'graffiti style {p}, street art, vibrant, urban, detailed, tag, mural###{np}, ugly, deformed, noisy, blurry, low contrast, realism, photorealistic',
    model: 'AlbedoBase XL (SDXL)',
    width: 1216,
    height: 832,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  retrofuturistic: {
    prompt:
      'retro-futuristic {p} . vintage sci-fi, 50s and 60s style, atomic age, vibrant, highly detailed###{np}, contemporary, realistic, rustic, primitive',
    model: 'AlbedoBase XL (SDXL)',
    width: 1216,
    height: 832,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  dystopian: {
    prompt:
      'dystopian style {p} . bleak, post-apocalyptic, somber, dramatic, highly detailed###{np},ugly, deformed, noisy, blurry, low contrast, cheerful, optimistic, vibrant, colorful',
    model: 'AlbedoBase XL (SDXL)',
    width: 1216,
    height: 832,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  sdxlcatgirlportrait: {
    prompt:
      'high quality, intricate, fluffy tail, cat ears, a full-body portrait of a catgirl, {p}, photorealistic, magical realism, fantasy###{np}, (Drawing cartoon comic sketch 2d render:0.7)',
    model: 'AlbedoBase XL (SDXL)',
    width: 832,
    height: 1216,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  neonnoir: {
    prompt:
      'neon noir {p}, cyberpunk, dark, rainy streets, neon signs, high contrast, low light, vibrant, highly detailed###bright, sunny, daytime, low contrast, black and white, sketch, watercolor, {np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 1024,
    height: 1024,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  floralceramic: {
    prompt:
      'a ceramic diorama of {p}, by Carlos Santos and Christine tennenholtz Lisa Frank, floral, glossy ceramic flowers, Rainbow prism, spectral colors, refracted light, vibrant hues, dazzling display, Picturesque, Gut Feeling, Seasoned photographer, Olympus PEN-F, blooming beauty, delicate petals, intricate 3d floral patterns###2d printed drawing sketch cgi render cartoon comic manga animation anime lineart, plain background{np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 1152,
    height: 832,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  sovietpropaganda: {
    prompt:
      'USSR soviet propaganda poster, {p}###photorealistic, cute, modern,{np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 768,
    height: 1344,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  moderntarotcard: {
    prompt:
      '((A modern Tarot card)), {p}###photorealistic, cute, modern, simple, anime, plain, vector, lowres, cropped, limneart, cgi, 3d, antique{np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 832,
    height: 1280,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  antiquetarotcard: {
    prompt:
      'A hand-painted 15th century Visconti-Sforza style Trionfi Tarot card, antique painting of {p}, with name below, detailed painting###photorealistic, cute, modern, simple, anime, plain, vector, lowres, cropped, limneart, cgi, 3d{np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 832,
    height: 1280,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  playingcard: {
    prompt:
      'A modern playing card, {p}###{np}, photorealistic, cute, lowres, cropped, cgi, 3d, pixelated',
    model: 'AlbedoBase XL (SDXL)',
    width: 832,
    height: 1280,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  mtgcard: {
    prompt:
      'A mtg magic the gathering card, painting of fantasy creature. description, {p}, mtg magic the gathering style###{np}, lowres, cropped, cgi, pixelated, photorealistic, 3d render',
    model: 'AlbedoBase XL (SDXL)',
    width: 832,
    height: 1152,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  baseballcard: {
    prompt:
      'A baseball trading card, picture of player, stats in corner, {p}###{np}, lowres, cropped, cgi, pixelated, cute',
    model: 'AlbedoBase XL (SDXL)',
    width: 832,
    height: 1152,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  greetingcard: {
    prompt: 'A greeting card, {p}###{np}, lowres, cropped, cgi, pixelated',
    model: 'AlbedoBase XL (SDXL)',
    width: 832,
    height: 1280,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  postcard: {
    prompt:
      'A souvenir postcard, {p}###{np}, lowres, cropped, cgi, pixelated, padding, border',
    model: 'AlbedoBase XL (SDXL)',
    width: 1280,
    height: 832,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  goldenagecomics: {
    prompt:
      '{p}, 1940s golden age comics style screen print, cover art by CC Beck and Will Eisner, (thick lines:0.7), early CMYK lithography, halftones###3d, modern, black and white, spot color{np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 832,
    height: 1280,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  manga: {
    prompt:
      '(manga, heavy outlines, thick linework, monochrome, flat, black and white:1.2), {p}###(3d, color){np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 896,
    height: 1152,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  sdxlanime: {
    prompt:
      'anime artwork, {p}, dramatic, anime style, key visual, vibrant, studio anime, highly detailed###photo, deformed, black and white, realism, disfigured, low contrast{np}, ink and paper',
    model: 'AlbedoBase XL (SDXL)',
    width: 1152,
    height: 896,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  portraitphoto: {
    prompt:
      'portrait photo of {p}, photograph, highly detailed face, depth of field, moody light, style by Dan Winters, Russell James, Steve McCurry, centered, extremely detailed, Nikon D850, award winning photography###disfigured{np}, closeup, cropped',
    model: 'ICBINP XL',
    width: 896,
    height: 1152,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  sdxlspace: {
    prompt:
      '{p}, by Andrew McCarthy, Navaneeth Unnikrishnan, Manuel Dietrich, photo realistic, 8 k, cinematic lighting, hd, atmospheric, hyperdetailed, trending on artstation, deviantart, photography, glow effect###{np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 1344,
    height: 768,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  schematic: {
    prompt:
      '23rd century scientific schematics for {p}, blueprint, hyperdetailed vector technical documents, callouts, legend, patent registry, clean linework, crisp lines###{np}, blurry',
    model: 'SDXL 1.0',
    width: 1152,
    height: 896,
    steps: 22,
    cfg_scale: 6,
    sampler_name: 'k_dpmpp_2m'
  },
  futurefashion: {
    prompt:
      'photograph of a Fashion model, {p}, full body, highly detailed and intricate, vibrant colors, hyper maximalist, futuristic, luxury, elite, cinematic, fashion, depth of field, colorful, glow, trending on artstation, ultra realistic, cinematic lighting, focused, 8k, (golden ratio:0.7)###{np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 896,
    height: 1152,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  building: {
    prompt:
      '{p}, shot 35 mm, realism, octane render, 8k, trending on artstation, 35 mm camera, unreal engine, hyper detailed, photo - realistic maximum detail, volumetric light, realistic matte painting, hyper photorealistic, trending on artstation, ultra-detailed, realistic###{np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 1152,
    height: 896,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  animal: {
    prompt:
      '{p}, wildlife photography, photograph, high quality, wildlife, f 1.8, soft focus, 8k, national geographic, award-winning photograph by nick nichols###{np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 1280,
    height: 832,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  vaporwave: {
    prompt:
      'vaporwave synthwave style {p}, cyberpunk, neon, vibes, stunningly beautiful, crisp, detailed, sleek, ultramodern, high contrast, cinematic composition###illustration, painting, crayon, graphite, abstract, glitch, deformed, mutated, ugly, disfigured, blurry{np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 1344,
    height: 768,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  isometric: {
    prompt:
      'isometric style {p}, vibrant, beautiful, crisp, detailed, ultra detailed, intricate###deformed, mutated, ugly, disfigured, blur, blurry, noise, noisy, realistic, photographic{np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 1024,
    height: 1024,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  lowpoly: {
    prompt:
      'low-poly style {p}, ambient occlusion, low-poly game art, (polygon mesh:0.8), jagged, blocky, (wireframe edges:0.8), centered composition###noisy, sloppy, messy, grainy, highly detailed, ultra textured, photo, black and white, grayscale, colorless{np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 1280,
    height: 832,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  claymation: {
    prompt:
      'claymation style {p}, sculpture, clay art, centered composition, play-doh###{np}, sloppy, messy, grainy, highly detailed, ultra textured, photo, mutated',
    model: 'AlbedoBase XL (SDXL)',
    width: 1280,
    height: 832,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  origami: {
    prompt:
      'origami style {p}, paper art, pleated paper, folded, origami art, pleats, cut and fold, centered composition###noisy, sloppy, messy, grainy, highly detailed, ultra textured, photo{np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 1024,
    height: 1024,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  lineart: {
    prompt:
      'line art drawing, {p}, professional, sleek, modern, minimalist, graphic, line art, vector graphics###{np}, anime, photorealistic, 35mm film, deformed, glitch, blurry, noisy, off-center, deformed, cross-eyed, closed eyes, bad anatomy, ugly, disfigured, mutated, realism, realistic, impressionism, expressionism, oil, acrylic',
    model: 'AlbedoBase XL (SDXL)',
    width: 1152,
    height: 896,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  pixelart: {
    prompt:
      'pixel-art, {p}, low-res, blocky, pixel art style, 16-bit graphics###sloppy, messy, blurry, noisy, highly detailed, ultra textured, photo, realistic{np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 1152,
    height: 896,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  embroidery: {
    prompt:
      '(Embroidery) knitting pattern of {p}, (cross stitch)###photorealistic{np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 1024,
    height: 1024,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  broadsheetart: {
    prompt: 'antique broadsheet drawing, {p}, text, monotone###{np}, colorful',
    model: 'AlbedoBase XL (SDXL)',
    width: 896,
    height: 1152,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  watercolorscenery: {
    prompt:
      'watercolor painting of {p}, broad brush strokes, soft colors###photorealistic, 3d{np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 1344,
    height: 768,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  pencilscribbles: {
    prompt:
      '`Scribbled random lines, shape of {p}, pencil scribbles sketch###solid outlines, color, fill, 3d{np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 1024,
    height: 1024,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  sdxlchibis: {
    prompt:
      'high quality, a chibi {p}, blindbox style, 3dcute, 3dcutecharacter, 3d, cute###{np}, (Drawing cartoon comic sketch 2d:0.6), spritesheet, multiple angles, (giant hand, minifig:0.7)',
    model: 'AlbedoBase XL (SDXL)',
    width: 1024,
    height: 1024,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  sdxlstreetfashion: {
    prompt:
      'high quality, intricate, (fashionable clothes, street fashion:1.2), a full-body portrait of a fashionable {p}, attractive, photorealistic, magical realism, fantasy###{np}, (Drawing cartoon comic sketch 2d render, sexy:0.7)',
    model: 'AlbedoBase XL (SDXL)',
    width: 896,
    height: 1152,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  sdxlhorror: {
    prompt:
      'nightmare horror trypophobia odontophobia thalassophobia disgusting nasty ugly bloody terror, {p}###{np}, attractive, sexy',
    model: 'AlbedoBase XL (SDXL)',
    width: 1024,
    height: 1024,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  animation: {
    prompt:
      '(cute), {p}, (animated by Mike Judge)###{np}, horror, ugly, 3d, photorealistic, black and white',
    model: 'AlbedoBase XL (SDXL)',
    width: 1152,
    height: 896,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  disney: {
    prompt:
      '(cute), {p}, (classic disney animation)###{np}, 3d, horror, ugly, photorealistic',
    model: 'AlbedoBase XL (SDXL)',
    width: 1152,
    height: 896,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  pixar: {
    prompt:
      '(cute), {p}, (rendered by pixar)###{np}, 2d, horror, ugly, photorealistic, black and white',
    model: 'AlbedoBase XL (SDXL)',
    width: 1152,
    height: 896,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  cyborgpunkportrait: {
    prompt:
      'lomography, {p}, a neon cyborg portrait by Jerry Ryan Rob Hefferan Artgerm HR Giger, hyperrealistic vaporwave HDR render###{np}, drawing, sketch',
    model: 'AlbedoBase XL (SDXL)',
    width: 832,
    height: 1216,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  movieposter: {
    prompt:
      'highly detailed movie premiere poster, {p}, professional quality, highly detailed, gloss finish###smudged, poor quality, Badly drawn hands and fingers, undetailed, unfocused, {np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 832,
    height: 1216,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  glitchart: {
    prompt:
      '{p}###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    width: 512,
    height: 640,
    loras: [
      {
        name: '71125',
        inject_trigger: 'any'
      }
    ]
  },
  oldvhs: {
    prompt:
      'old vhs footage of {p}, distortion, glitch###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    width: 512,
    height: 640,
    loras: [
      {
        name: '103667'
      }
    ]
  },
  pixelsorting: {
    prompt:
      '{p}###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    width: 512,
    height: 640,
    loras: [
      {
        name: '57963',
        inject_trigger: 'any'
      }
    ]
  },
  analogdistortion: {
    prompt:
      'AnalogDistortion, Analog Photo of {p}###{np}, worst quality, EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, Humpbacked, disfigured, mutation, mutated, extra limb, ugly, missing limb, floating limbs, disconnected limbs, malformed hands, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    width: 512,
    height: 640,
    loras: [
      {
        name: '104917'
      }
    ]
  },
  gothichorrorai: {
    prompt:
      '{p}###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '39760',
        inject_trigger: 'any'
      }
    ]
  },
  tentaclehorrorai: {
    prompt:
      '{p}###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '42468',
        inject_trigger: 'any'
      }
    ]
  },
  reelhorror: {
    prompt:
      'portrait of {p}, reelhorror, blood, dripping, mutation, mouthface, trash, pov, pov scene, extra eyes###{np}, cropped, out of focus, monochrome, symbol, text, logo, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '67666'
      }
    ]
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
      {
        name: '67666',
        model: 0.7,
        clip: 1
      }
    ]
  },
  ivorygoldai: {
    prompt:
      '{p}###{np}, cropped, out of focus, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '62700',
        inject_trigger: 'any'
      }
    ]
  },
  arielphorror: {
    prompt:
      '{p}, arielpstyle, dark horror, creepy creepy-looking, painting, lovecraftian, grease, painting \\(medium\\), drawing, brush stroke###{np}, cropped, out of focus, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Lyriel',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '39760'
      }
    ]
  },
  dreadhorror: {
    prompt:
      '{p}, Dread, horror, nightmare###{np}, cropped, out of focus, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Deliberate',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '98011'
      }
    ]
  },
  'vibrant halloween': {
    prompt:
      'a Halloween themed vibrant pulp art by JC leyendecker and norman rockwell featuring {p}. horror vibe, dark atmospthere, depth of field, campy, spooky. purple, orange and green color palette.###{np}',
    model: 'AlbedoBase XL (SDXL)',
    karras: true,
    steps: 25,
    sampler_name: 'k_dpmpp_2m',
    width: 1024,
    height: 1024,
    cfg_scale: 7
  },
  'glitch horror': {
    prompt:
      'Analog glitch horror style portrait of a {p} in the shadows, best quality, masterpiece, dark, nightmare fuel###{np}',
    model: 'stable_diffusion',
    karras: true,
    steps: 25,
    sampler_name: 'k_dpmpp_2m',
    width: 1024,
    height: 1024,
    hires_fix: true,
    cfg_scale: 9
  },
  'monstrous burton': {
    prompt:
      '{p} . nightmare by Tim Burton, monster-like, cinematic lighting, trending on artstation, creepy digital art###{np}',
    model: 'AlbedoBase XL (SDXL)',
    steps: 30,
    sampler_name: 'k_dpmpp_2m',
    width: 1024,
    height: 1024,
    cfg_scale: 7
  },
  'spooky gouache': {
    prompt:
      '{p} . spooky gouache digital art, dark, creepy, highly detailed, moody, mysterious###{np}, 3d, photo, anime, text',
    model: 'AlbedoBase XL (SDXL)',
    steps: 30,
    sampler_name: 'k_dpmpp_2m',
    width: 1024,
    height: 1024,
    cfg_scale: 7
  },
  'spooky horror': {
    prompt:
      '{p}, spooky, dark, horror aesthetics, sharp focus, Innistrad, by Keith Thompson###person, human, blurry, black and white, text, {np}',
    model: 'AlbedoBase XL (SDXL)',
    steps: 25,
    sampler_name: 'k_euler_a',
    width: 1024,
    height: 1024,
    cfg_scale: 9
  },
  'crungus revenge': {
    prompt:
      'Crungus, halloween, spooky, ink painting manga illustration, bloody disgusting, limited palette, chiaroscuro, {p}, by kentaro miura, junji ito, Yusuke Murata',
    model: 'AlbedoBase XL (SDXL)',
    karras: true,
    steps: 20,
    sampler_name: 'k_dpmpp_2m',
    width: 1280,
    height: 960,
    cfg_scale: 8.5
  },
  'impressionist horror comic': {
    prompt:
      'impressionist purple and orange comickbook illustration depicting closeup of {p}, dark shading, bold outlines, thick outlines, creepy, eerie, scary, horror###{np}',
    model: 'AlbedoBase XL (SDXL)',
    steps: 20,
    sampler_name: 'k_euler_a',
    width: 1024,
    height: 1024,
    cfg_scale: 9
  },
  'impressionist oil painting': {
    prompt:
      'A beautiful oil painting of {p}, with thick messy brush strokes ### blurry, out of focus{np}',
    model: 'AlbedoBase XL (SDXL)',
    karras: true,
    steps: 8,
    sampler_name: 'k_dpm_fast',
    width: 1280,
    height: 832,
    cfg_scale: 2
  },
  'flat simple cartoon': {
    prompt: '{p}, wikihow cartoon illustration###3d, photo, text, {np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 1024,
    height: 1024,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  'color splash': {
    prompt: '{p}, painted world, colorful splashes###{np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 1024,
    height: 1024,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      },
      {
        name: '273924',
        model: 0.75,
        is_version: true
      }
    ]
  },
  parchment: {
    prompt: 'on parchment, ink illustration, {p}###{np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 1024,
    height: 1024,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      },
      {
        name: '285737',
        model: 1,
        is_version: true
      }
    ]
  },
  'emoji 3d': {
    prompt:
      '{p} . cgi emoji centered icon, cute, solid white background###nsfw, flat, 2d, photo, anime, {np}',
    model: 'Fustercluck',
    width: 1024,
    height: 1024,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  'emoji 2d': {
    prompt:
      '{p} . flat 2d emoji icon, cute, crisp outlined icon art, colorful, centered, on a solid white background###nsfw, 3d, octane render, photo, anime, {np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 1024,
    height: 1024,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  'fustercluck 3d': {
    prompt:
      '{p} . cgi render, volumetric lighting###nsfw, anime, 2d, flat, photo, {np}',
    model: 'Fustercluck',
    width: 1024,
    height: 1024,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  'vector illustration': {
    prompt:
      '{p} . digital vector art, svg, adobe illustrator, made in procreate###nsfw, text, 3d, photo, anime, {np}',
    model: 'AlbedoBase XL (SDXL)',
    width: 1024,
    height: 1024,
    steps: 8,
    cfg_scale: 2,
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  piratepunk: {
    prompt:
      '{p}, piratepunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '45892'
      }
    ]
  },
  lunarpunk: {
    prompt:
      '{p}###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '97136',
        inject_trigger: 'any'
      }
    ]
  },
  celtpunk: {
    prompt:
      '{p}###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '92008',
        inject_trigger: 'any'
      }
    ]
  },
  toxicpunk: {
    prompt:
      '{p}###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '95802',
        inject_trigger: 'any'
      }
    ]
  },
  mongolpunk: {
    prompt:
      '{p}###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '85109',
        inject_trigger: 'any'
      }
    ]
  },
  musketpunk: {
    prompt:
      '{p}###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '90543',
        inject_trigger: 'any'
      }
    ]
  },
  absinthepunk: {
    prompt:
      '{p}###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '89183',
        inject_trigger: 'any'
      }
    ]
  },
  cattlepunk: {
    prompt:
      '{p}###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '95828',
        inject_trigger: 'any'
      }
    ]
  },
  circuspunk: {
    prompt:
      '{p}###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '87884',
        inject_trigger: 'any'
      }
    ]
  },
  aetherpunk: {
    prompt:
      '{p}###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '85036',
        inject_trigger: 'any'
      }
    ]
  },
  potatopunk: {
    prompt:
      '{p}###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '72231',
        inject_trigger: 'any'
      }
    ]
  },
  coalpunk: {
    prompt:
      '{p}, coalpunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '84753'
      }
    ]
  },
  alchemypunk: {
    prompt:
      '{p}, alchemypunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '78766'
      }
    ]
  },
  gothicpunk: {
    prompt:
      '{p}, gothicpunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '78695'
      }
    ]
  },
  witchpunk: {
    prompt:
      '{p}, WitchcraftPunkAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '78280'
      }
    ]
  },
  colorpunk: {
    prompt:
      '{p}, PunkPunkAI, colorful###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '78060'
      }
    ]
  },
  bronzepunk: {
    prompt:
      '{p}, bronzepunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '77293'
      }
    ]
  },
  neonpunk: {
    prompt:
      '{p}, CyberpunkAI, neon###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '77121'
      }
    ]
  },
  kazakpunk: {
    prompt:
      '{p}, kazakpunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '76737'
      }
    ]
  },
  grecopunk: {
    prompt:
      '{p}, grecopunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '76190'
      }
    ]
  },
  romanpunk: {
    prompt:
      '{p}, romapunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '76190'
      }
    ]
  },
  sovietpunk: {
    prompt:
      '{p}, sovietpunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '75709'
      }
    ]
  },
  arabiannightspunk: {
    prompt:
      '{p}, 1001ArabianNights###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '69315'
      }
    ]
  },
  steampunk: {
    prompt:
      '{p}, SteampunkAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '59338'
      }
    ]
  },
  cogpunk: {
    prompt:
      '{p}, CogPunkAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '59338'
      }
    ]
  },
  victorianpunk: {
    prompt:
      '{p}, VictorianPunkAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '84250'
      }
    ]
  },
  biopunk: {
    prompt:
      '{p}, BiopunkAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '80375'
      }
    ]
  },
  mahabharatapunk: {
    prompt:
      '{p}, MahabharataPunkAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '71478'
      }
    ]
  },
  javapunk: {
    prompt:
      '{p}, javapunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '72415'
      }
    ]
  },
  balipunk: {
    prompt:
      '{p}, balipunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '72347'
      }
    ]
  },
  dieselpunk: {
    prompt:
      '{p}, dieselpunkAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '64676'
      }
    ]
  },
  totempunk: {
    prompt:
      '{p}, TotempunkAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '71819'
      }
    ]
  },
  samuraipunk: {
    prompt:
      '{p}, SamuraiPunkAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '69108'
      }
    ]
  },
  zulupunk: {
    prompt:
      '{p}, zulupunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '65725'
      }
    ]
  },
  teslapunk: {
    prompt:
      '{p}, teslapunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '64955'
      }
    ]
  },
  valvepunk: {
    prompt:
      '{p}, valvepunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '64955'
      }
    ]
  },
  infernalpunk: {
    prompt:
      '{p}, 1nf3rnalAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '62585'
      }
    ]
  },
  solarpunk: {
    prompt:
      '{p}, solarpunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '43944'
      }
    ]
  },
  stonepunk: {
    prompt:
      '{p}, stonepunkAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '51539'
      }
    ]
  },
  gempunk: {
    prompt:
      '{p}, GemstoneAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '49374'
      }
    ]
  },
  horrorpunk: {
    prompt:
      '{p}, ManyEyedHorrorAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '47489'
      }
    ]
  },
  bonepunk: {
    prompt:
      '{p}, BoneyardAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '48356'
      }
    ]
  },
  oldegyptpunk: {
    prompt:
      '{p}, OldEgyptAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '43229'
      }
    ]
  },
  vikingpunk: {
    prompt:
      '{p}, vikingpunkai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '41364'
      }
    ]
  },
  gaslamppunk: {
    prompt:
      '{p}, GasLampFantasyAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '71335'
      }
    ]
  },
  atompunk: {
    prompt:
      '{p}, 1970retrofuturism###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '64235'
      }
    ]
  },
  gothpunk: {
    prompt:
      '{p}, PastelGothAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '75265'
      }
    ]
  },
  circuitpunk: {
    prompt:
      '{p}, CircuitBoardAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '58410'
      }
    ]
  },
  nightmarepunk: {
    prompt:
      '{p}, NightmarishAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '56336'
      }
    ]
  },
  crystalpunk: {
    prompt:
      '{p}, crystallineAI###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '48859'
      }
    ]
  },
  fantasypunk: {
    prompt:
      '{p}, fairytaleai###{np}, worst quality, low quality:1.4), EasyNegative, bad anatomy, bad hands, cropped, missing fingers, missing toes, too many toes, too many fingers, missing arms, long neck, Humpbacked, deformed, disfigured, poorly drawn face, distorted face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long body, monochrome, symbol, text, logo, door frame, window frame, mirror frame',
    model: 'Dreamshaper',
    steps: 40,
    cfg_scale: 7.5,
    loras: [
      {
        name: '42260'
      }
    ]
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
    steps: 40,
    width: 1024,
    height: 1024,
    model: 'AlbedoBase XL (SDXL)'
  },
  nightmare: {
    prompt:
      '{p} by Aaron Horkey, by Adonna Khare, by Carrie Ann Baade, by Jeff Lemire, by Junji Ito, horror, creepy, dark, eldritch, fantasy{np}',
    steps: 40,
    width: 1024,
    height: 1024,
    model: 'AlbedoBase XL (SDXL)'
  },
  abandoned: {
    prompt:
      'Old found footage of hyper realistic {p}, abandoned, liminal space, horror, eerie, mysterious, noise and grain, dark hues, dark tones, single source of light, 35mm, Kodak Autochrome, floating particles, auto flash, auto focus###blurry, out of focus{np}',
    steps: 40,
    width: 1280,
    height: 832,
    model: 'AlbedoBase XL (SDXL)',
    sampler_name: 'dpmsolver'
  },
  'witch land': {
    prompt:
      'digital art of {p}, witch world, Halloween theme, scenic Halloween, highly detailed, zbrush, by artist Artgerm, by artist Stephen Hickman, by artist Carne griffiths{np}',
    steps: 40,
    width: 1024,
    height: 1024,
    model: 'AlbedoBase XL (SDXL)'
  },
  'nightmare fairytale': {
    prompt:
      'horror {p} in a dark forest, darkness, fog, very detailed, cold, Editorial illustration, gothic, evil, art by Sam Bosma, painting by H.P. Lovecraft{np}',
    steps: 40,
    width: 1024,
    height: 1024,
    model: 'AlbedoBase XL (SDXL)'
  },
  elmstreet: {
    prompt:
      'drawing of {p} by tim burton, by Aaron Horkey, by H R Giger, creepy, horror, sharp, focused, HD, detailed{np}',
    steps: 40,
    width: 832,
    height: 1280,
    model: 'AlbedoBase XL (SDXL)'
  },
  ennui: {
    prompt: '{p}, black and white, foggy, negative, eerie{np}',
    model: 'AlbedoBase XL (SDXL)',
    steps: 40,
    width: 1024,
    height: 1024,
    sampler_name: 'dpmsolver'
  },
  'dark fantasy': {
    prompt:
      'highly detailed digital painting of {p}, highly realistic fantasy concept art by Darek Zabrocki and Zdzisław Beksiński, paint strokes, intricate, eerie scenery, dark volumetric lighting, triadic color scheme, very coherent, sharp focus, illustration, film grain, spooky vibe{np}',
    steps: 40,
    width: 1024,
    height: 1024,
    model: 'AlbedoBase XL (SDXL)'
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
      'epic {p} iced snow landscape battles in prehistory, vasteness, Albert Bierstadt, valleys, luminous golden hour, lifey landscape, beautiful, vibrant, abandoned overgrown mountains ###lowres, text, error, cropped, worst quality, jpeg artifacts, signature, watermark, deformed{np}',
    model: 'stable_diffusion_2.1',
    sampler_name: 'dpmsolver',
    width: 768,
    height: 768
  },
  'warrior fairy': {
    prompt:
      'beautiful warrior fairy {p}, portrait, up close, cinematic, snowy background, dramatic lighting, highly detailed, very intricate, meta, fanciful, optimistic, wide shot, volumetric lighting, bokeh blur, unreal engine, octane render ### deformed, ugly, mutated, watermark, trademark, border, nude, NSFW{np}',
    model: 'stable_diffusion'
  },
  cyberrealistic: {
    prompt: '{p}###{np}',
    model: 'CyberRealistic',
    tis: [
      {
        name: '77976',
        inject_ti: 'negprompt'
      }
    ]
  },
  deliberate: {
    prompt: '{p}###{np}',
    model: 'Deliberate'
  },
  deliberate3: {
    prompt: '{p}###{np}',
    width: 768,
    height: 768,
    model: 'Deliberate 3.0'
  },
  'majicmix realistic': {
    prompt: '{p}###{np}',
    model: 'majicMIX realistic'
  },
  'edge of realism': {
    prompt: '{p}###{np}',
    model: 'Edge Of Realism'
  },
  'dreamlike photoreal': {
    prompt: '{p}###{np}',
    model: 'Dreamlike Photoreal'
  },
  'realistic vision': {
    prompt: '{p}###{np}',
    model: 'Realistic Vision'
  },
  neurogen: {
    prompt: '{p}###{np}',
    model: 'Neurogen'
  },
  illuminati: {
    prompt: '{p}###{np}',
    model: 'Illuminati Diffusion'
  },
  realbiter: {
    prompt: '{p}###{np}',
    model: 'RealBiter'
  },
  faetastic: {
    prompt: '{p}###{np}',
    model: 'FaeTastic'
  },
  danmumford: {
    prompt: 'In the style of Dan Mumford, {p}###{np}',
    model: 'Dan Mumford Style',
    width: 768,
    height: 960,
    steps: 27,
    hires_fix: true,
    cfg_scale: 7
  },
  'moonmix fantasy': {
    prompt: '{p}###{np}',
    model: 'MoonMix Fantasy'
  },
  icbinp: {
    prompt: '{p}###{np}',
    model: "ICBINP - I Can't Believe It's Not Photography"
  },
  'icbinp xl': {
    prompt: '{p}###{np}',
    width: 832,
    height: 1216,
    steps: 10,
    cfg_scale: 3.5,
    model: 'ICBINP XL',
    sampler_name: 'k_euler_a',
    loras: [
      {
        name: '246747',
        model: 1,
        is_version: true
      }
    ]
  },
  fustercluck: {
    prompt: '{p}###{np}',
    width: 832,
    height: 1216,
    steps: 10,
    cfg_scale: 2.5,
    model: 'Fustercluck',
    sampler_name: 'k_dpmpp_sde',
    loras: [
      {
        name: '247778',
        model: 1,
        is_version: true
      }
    ]
  },
  meinamix: {
    prompt: '{p}###{np}',
    model: 'MeinaMix'
  },
  'mistoon amethyst': {
    prompt: '{p}###{np}',
    model: 'Mistoon Amethyst'
  },
  'galena redux': {
    prompt: '{p}###{np}',
    model: 'Galena Redux'
  },
  'dark sushi': {
    prompt: '{p}###{np}',
    model: 'Dark Sushi Mix'
  },
  'analog madness': {
    prompt: '{p}###{np}',
    model: 'Analog Madness'
  },
  bweshmix: {
    prompt: '{p}###{np}, embedding:16993',
    model: 'BweshMix',
    width: 704,
    height: 960,
    steps: 25,
    hires_fix: true,
    cfg_scale: 7.5,
    loras: [
      {
        name: '82098',
        model: 0.5
      },
      {
        name: '48139',
        model: 0.2
      },
      {
        name: '132532',
        model: -0.7
      },
      {
        name: '58390',
        model: 0.5
      }
    ],
    tis: [
      {
        name: '16993'
      }
    ]
  },
  revanimated: {
    prompt: '{p}###{np}',
    model: 'Rev Animated'
  },
  'cetus-mix': {
    prompt: '{p}###{np}',
    model: 'Cetus-Mix'
  },
  realisian: {
    prompt: '{p}###{np}',
    model: 'Realisian'
  },
  reliberate: {
    prompt: '{p}###{np}',
    model: 'Reliberate'
  },
  toonyou: {
    prompt: '{p}###{np}',
    model: 'ToonYou'
  },
  'western animation': {
    prompt: '{p}###{np}',
    model: 'Western Animation Diffusion'
  },
  anything: {
    prompt:
      '{p}, shadows, lights, outline, highly detailed###cropped, artifacts, lowres{np}',
    model: 'Anything Diffusion'
  },
  anything_raw: {
    prompt: '{p}{np}',
    model: 'Anything Diffusion'
  },
  waifu: {
    prompt:
      '{p}, shadows, lights, outline, highly detailed###cropped, artifacts, lowres{np}',
    model: 'waifu_diffusion'
  },
  waifu_raw: {
    prompt: '{p}{np}',
    model: 'waifu_diffusion'
  },
  hentai: {
    prompt:
      '{p}, shadows, lights, outline, highly detailed, anime###cropped, artifacts, lowres{np}',
    model: 'Hentai Diffusion'
  },
  hentai_raw: {
    prompt: '{p}{np}',
    model: 'Hentai Diffusion'
  },
  poison: {
    prompt:
      '{p}, shadows, lights, outline, highly detailed, anime###cropped, artifacts, lowres{np}',
    model: 'Poison'
  },
  poison_raw: {
    prompt: '{p}{np}',
    model: 'Poison'
  },
  eimis: {
    prompt:
      '{p}, shadows, lights, outline, highly detailed, anime###cropped, artifacts, lowres{np}',
    model: 'Eimis Anime Diffusion'
  },
  eimis_raw: {
    prompt: '{p}{np}',
    model: 'Eimis Anime Diffusion'
  },
  acertainthing: {
    prompt:
      '{p}, shadows, lights, outline, highly detailed, anime###cropped, artifacts, lowres{np}',
    model: 'ACertainThing'
  },
  acertainthing_raw: {
    prompt: '{p}{np}',
    model: 'ACertainThing'
  },
  scalie: {
    prompt:
      'e621, highly detailed fullbody of a fully clothed solo scalie {p}, detailed scales, volumetric lighting, looking at viewer, by Michael & Inessa Garmash and  Ruan Jia and Ross Tran and Pino Daeni###cropped, artifacts, lowres###crosseyed, human, human skin, human head, human hands, human face, three hands, three feet, three arms, three legs, text bubble, no pupils, simple background, bad anatomy, deformed face, undefined, incomplete, uncertain, smudge, melt, smear, disproportional, disfigured, deformed, malformed, mutant, monstrous, ugly, gross, disgusting, blurry, poorly drawn, extra limbs, extra fingers, missing limbs, amputee, malformed hands, genitals, breasts, naked, dialogue, text, feral{np}',
    model: 'Yiffy'
  },
  furry: {
    prompt:
      'e621, highly detailed fullbody of a fully clothed solo anthro {p}, pants, detailed fluffy fur, fluffy tail, volumetric lighting, looking at viewer, by Michael & Inessa Garmash and  Ruan Jia and Ross Tran and Pino Daeni###cropped, artifacts, lowres###crosseyed, human, human skin, human head, human hands, human face, three hands, three feet, three arms, three legs, text bubble, no pupils, simple background, bad anatomy, deformed face, undefined, incomplete, uncertain, smudge, melt, smear, disproportional, disfigured, deformed, malformed, mutant, monstrous, ugly, gross, disgusting, blurry, poorly drawn, extra limbs, extra fingers, missing limbs, amputee, malformed hands, genitals, breasts, naked, dialogue, text, feral{np}',
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
  robo: {
    prompt: '{p}, nousr robot{np}',
    model: 'Robo-Diffusion'
  },
  'classic animation': {
    prompt: '{p}, classic disney style{np}',
    model: 'Classic Animation Diffusion'
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
  vectorartz: {
    prompt: '{p}, vectorartz{np}',
    model: 'vectorartz'
  },
  ranma: {
    prompt: '{p}, 80sanimestyle{np}',
    model: 'Ranma Diffusion'
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
  paintart: {
    prompt: '{p}, mdjrny-pntrt{np}',
    model: 'Midjourney PaintArt'
  },
  ghibli: {
    prompt: '{p}, ghibli style{np}',
    model: 'Ghibli Diffusion'
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
  dreamlike: {
    prompt: '{p}, dreamlikeart{np}',
    model: 'Dreamlike Diffusion'
  },
  analog: {
    prompt: '{p}, analog style{np}',
    model: 'Analog Diffusion'
  },
  dublex: {
    prompt: '{p}, dublex{np}',
    model: 'Double Exposure Diffusion'
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
  trinart_character_raw: {
    prompt: '{p}{np}',
    model: 'Trinart Characters'
  },
  portraitplus: {
    prompt: '{p}, portrait+ style{np}',
    model: 'PortraitPlus'
  },
  vintedois: {
    prompt: '{p}, estilovintedois{np}',
    model: 'Vintedois Diffusion'
  },
  eternos: {
    prompt: '{p}, romerorzeternos{np}',
    model: 'Eternos'
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
  marvel: {
    prompt: '{p}, whatif style{np}',
    model: 'Marvel Diffusion'
  }
}

// Random stuff I've found on Reddit that seems interesting.
// TODO: Backfeed these into main Stable Horde styles.
const customStyles = {
  turbo: {
    prompt: '{p}###nsfw,loli,{np}',
    model: 'AlbedoBase XL (SDXL)',
    sampler_name: 'lcm',
    steps: 8,
    width: 1024,
    height: 1024,
    cfg_scale: 2,
    loras: [
      {
        name: '216190',
        model: 1
      }
    ]
  },
  'turbo-landscape': {
    prompt: '{p}###nsfw,loli,{np}',
    model: 'AlbedoBase XL (SDXL)',
    sampler_name: 'lcm',
    steps: 8,
    width: 1280,
    height: 832,
    cfg_scale: 2,
    loras: [
      {
        name: '216190',
        model: 1
      }
    ]
  },
  'turbo-portrait': {
    prompt: '{p}###nsfw,loli,{np}',
    model: 'AlbedoBase XL (SDXL)',
    sampler_name: 'lcm',
    steps: 8,
    width: 832,
    height: 1216,
    cfg_scale: 2,
    loras: [
      {
        name: '216190',
        model: 1
      }
    ]
  }
}

export const stylePresets = sortAlphabetically({
  ...stableHordeStyles,
  ...customStyles
})
