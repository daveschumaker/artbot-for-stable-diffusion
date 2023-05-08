// Via: https://github.com/db0/Stable-Horde-Styles
// TODO: Automatically import and update
interface Preset {
  [key: string]: {
    prompt: string
    model?: string
    sampler_name?: string
    width?: number
    height?: number
  }
}

export const stylePresets: Preset = {
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
