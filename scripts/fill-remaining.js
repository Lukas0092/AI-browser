import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_PATH = join(__dirname, '..', 'public', 'data.json')
const data = JSON.parse(readFileSync(DATA_PATH, 'utf-8'))

const known = {
  'InVideo AI': 'https://cdn.invideo.io/static/img/og-image.png',
  'Tabnine': 'https://www.tabnine.com/wp-content/uploads/2024/01/tabnine-og.png',
  'Aider': 'https://aider.chat/assets/aider-og.png',
  'Pi': 'https://pi.ai/og-image.png',
  'Leonardo AI': 'https://cdn.leonardo.ai/leonardo-og.png',
  'Adobe Firefly': 'https://firefly.adobe.com/img/og-image.jpg',
  'Boomy': 'https://assets.boomy.com/og-image.png',
  'Freeletics': 'https://www.freeletics.com/images/og/freeletics-og.jpg',
  'Tripo AI': 'https://www.tripo3d.ai/og-image.png',
  'CSM AI': 'https://www.csm.ai/og-image.png',
  'PlayHT': 'https://play.ht/og-image.png',
  'WellSaid Labs': 'https://wellsaidlabs.com/wp-content/uploads/2023/og-image.png',
  'Consensus': 'https://consensus.app/images/og-image.png',
  'Elicit': 'https://elicit.com/og-image.png',
  'Canva AI': 'https://static.canva.com/web/images/og-image.png',
  'Looka': 'https://cdn.logojoy.com/wp-content/uploads/og-image.png',
  'Persado': 'https://www.persado.com/wp-content/uploads/persado-og.png',
}

let filled = 0
for (const cat of data.categories) {
  for (const tool of cat.tools) {
    if (!tool.preview && known[tool.name]) {
      tool.preview = known[tool.name]
      filled++
    }
  }
}

writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + '\n')
console.log(`Filled ${filled} remaining previews.`)
