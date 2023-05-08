import { GetSetPromptInput } from 'types'
import styles from './component.module.css'
import { useEffect, useState } from 'react'
import { Button } from 'components/UI/Button'
import { IconTags, IconX } from '@tabler/icons-react'
import Overlay from 'components/UI/Overlay'

const tags = [
  [
    'Drawing Style',
    [
      'Cel Shading',
      'Crosshatch',
      'Detailed and Intricate',
      'Doodle',
      'Dot Art',
      'Line Art',
      'Sketch',
      "Children's Drawing"
    ]
  ],
  [
    'Visual Style',
    [
      '16-bit',
      '2D',
      '8-bit',
      'Anaglyph',
      'Anime',
      'Art Nouveau',
      'Baroque',
      'Bauhaus',
      'Brutalist',
      'Cartoon',
      'CGI',
      'Comic Book',
      'Concept Art',
      'Constructivist',
      'Cubist',
      'Cyberpunk',
      'Dadaist',
      'Digital Art',
      'Dystopian',
      'Expressionist',
      'Fantasy',
      'Fauvist',
      'Figurative',
      'Geometric',
      'Graphic Novel',
      'Hard Edge Painting',
      'Hydrodipped',
      'Impressionistic',
      'Liminal space',
      'Lithography',
      'Manga',
      'Minimalist',
      'Modern Art',
      'Mosaic',
      'Mural',
      'Naive',
      'Neoclassical',
      'Photo',
      'Realistic',
      'Rococo',
      'Romantic',
      'Steampunk',
      'Street Art',
      'Stuckist',
      'Surrealist',
      'Symbolist',
      'Visual Novel',
      'Watercolor'
    ]
  ],
  [
    'Pen',
    ['Chalk', 'Colored Pencil', 'Graphite', 'Ink', 'Oil Paint', 'Pastel Art']
  ],
  [
    'Carving and Etching',
    [
      'Etching',
      'Linocut',
      'Paper Model',
      'Paper-Mache',
      'Papercutting',
      'Pyrography',
      'Wood-Carving'
    ]
  ],
  [
    'Camera',
    [
      'Aerial View',
      'Bokeh',
      'Canon50',
      'Cinematic',
      'Close-up',
      'Color Grading',
      'Dramatic',
      'Film Grain',
      'Fisheye Lens',
      'Glamor Shot',
      'Golden Hour',
      'HD',
      'Landscape',
      'Lens Flare',
      'Macro',
      'Nikon D800',
      'Photoshoot',
      'Polaroid',
      'Portrait',
      'Studio Lighting',
      'Vintage',
      'War Photography',
      'White Balance',
      'Wildlife Photography'
    ]
  ],
  [
    'Color',
    [
      'Beautiful Lighting',
      'Cold Color Palette',
      'Colorful',
      'Dynamic Lighting',
      'Electric Colors',
      'Infrared',
      'Neon',
      'Pastel',
      'Synthwave',
      'Volumetric Lighting',
      'Warm Color Palette'
    ]
  ],
  [
    'Emotions',
    [
      'Angry',
      'Bitter',
      'Disgusted',
      'Embarrassed',
      'Evil',
      'Excited',
      'Fear',
      'Funny',
      'Happy',
      'Horrifying',
      'Lonely',
      'Sad',
      'Serene',
      'Surprised',
      'Melancholic'
    ]
  ],
  [
    'Artists and communities',
    [
      'Artstation',
      'trending on Artstation',
      'CGSociety',
      'by Agnes Lawrence Pelton',
      'by Akihito Yoshida',
      'by Alex Grey',
      'by Alexander Jansson',
      'by Alphonse Mucha',
      'by Andy Warhol',
      'by Artgerm',
      'by Asaf Hanuka',
      'by Aubrey Beardsley',
      'by Banksy',
      'by Beeple',
      'by Ben Enwonwu',
      'by Bob Eggleton',
      'by Caravaggio Michelangelo Merisi',
      'by Caspar David Friedrich',
      'by Chris Foss',
      'by Claude Monet',
      'by Craig Mullins',
      'by Dan Mumford',
      'by Darek Zabrocki',
      'by David Mann',
      'by Diego Velázquez',
      'by Disney Animation Studios',
      'by Édouard Manet',
      'by Esao Andrews',
      'by Frida Kahlo',
      'by Gediminas Pranckevicius',
      `by Georgia O'Keeffe`,
      'by Greg Rutkowski',
      'by Gustave Doré',
      'by Gustave Klimt',
      'by H.R. Giger',
      'by Hayao Miyazaki',
      'by Henri Matisse',
      'by HP Lovecraft',
      'by Ilya Kuvshinov',
      'by Ivan Shishkin',
      'by Jack Kirby',
      'by Jackson Pollock',
      'by James Jean',
      'by Jean-Michel Basquiat',
      'by Jim Burns',
      'by Johannes Vermeer',
      'by John William Waterhouse',
      'by Katsushika Hokusai',
      'by Kim Tschang Yeul',
      'by Ko Young Hoon',
      'by Leonardo da Vinci',
      'by Lisa Frank',
      'by M.C. Escher',
      'by Mahmoud Saïd',
      'by Makoto Shinkai',
      'by Marc Simonetti',
      'by Mark Brooks',
      'by Michelangelo',
      'by Pablo Picasso',
      'by Paul Klee',
      'by Peter Mohrbacher',
      'by Pierre-Auguste Renoir',
      'by Pixar Animation Studios',
      'by Rembrandt',
      'by Richard Dadd',
      'by Rossdraws',
      'by Salvador Dalí',
      'by Sam Does Arts',
      'by Sandro Botticelli',
      'by Shaun Tan',
      'by Ted Nasmith',
      'by Ten Hundred',
      'by Thomas Kinkade',
      'by Tivadar Csontváry Kosztka',
      'by Victo Ngai',
      'by Vincent Di Fate',
      'by Vincent van Gogh',
      'by Wes Anderson',
      'by WLOP',
      'by Yoshitaka Amano',
      'by Zdzisław Beksiński'
    ]
  ],
  [
    'CGI Software',
    [
      '3D Model',
      '3D Sculpt',
      '3Ds Max Model',
      'Blender Model',
      'Cinema4d Model',
      'Maya Model',
      'Unreal Engine',
      'Zbrush Sculpt'
    ]
  ],
  [
    'CGI Rendering',
    [
      '3D Render',
      'Corona Render',
      'Creature Design',
      'Cycles Render',
      'Detailed Render',
      'Environment Design',
      'Glass Caustics',
      'Global Illumination',
      'Intricate Environment',
      'LSD Render',
      'Octane Render',
      'PBR',
      'Subsurface Scattering'
    ]
  ]
]

const StyleTagsDropdown = ({ input, setInput }: GetSetPromptInput) => {
  const [showMenu, setShowMenu] = useState(false)

  const addTagClick = (tag: string) => {
    setInput({ prompt: `${input.prompt}, ${tag}` })
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showMenu && e.key === 'Escape') {
        setShowMenu(false)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showMenu])

  return (
    <>
      <Button
        id="style-tag-tooltip"
        size="small"
        onClick={() => setShowMenu(!showMenu)}
        width="130px"
      >
        <IconTags stroke={1.5} />
        Style tags
      </Button>
      {showMenu && (
        <>
          <Overlay handleClose={() => setShowMenu(false)} disableBackground />
          <div className={styles['dropdown-menu']}>
            <div
              className={styles['StyledClose']}
              onClick={() => setShowMenu(false)}
            >
              <IconX stroke={1.5} />
            </div>
            <div className={styles['style-tags-wrapper']}>
              {tags.map(([section, elements]) => (
                <div
                  // @ts-ignore
                  key={section}
                  className="mb-2 px-2"
                >
                  <h2 className="font-[700] mb-1">{section}</h2>
                  <div className="" style={{ wordBreak: 'break-all' }}>
                    {
                      // @ts-ignore
                      elements.map((element) => (
                        <div
                          className={styles['tag']}
                          key={element}
                          onClick={() => {
                            addTagClick(element)
                          }}
                        >
                          {element}
                        </div>
                      ))
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default StyleTagsDropdown
