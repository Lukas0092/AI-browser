import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_PATH = join(__dirname, '..', 'public', 'data.json')
const data = JSON.parse(readFileSync(DATA_PATH, 'utf-8'))

// Known preview images for tools that block automated fetching
const knownPreviews = {
  'Napkin AI': 'https://www.napkin.ai/assets/v5/use-cases/presentations.png?v=3',
  'Kling 3.0': 'https://kling.ai/static/media/kling-og.png',
  'Google Veo 3.1': 'https://lh3.googleusercontent.com/KjZqcrU67NVMcKTQvMWdvOVVVa6FUIceiCX26ZhSZzEpowbl3hu_-BI91LpSMKrcXdTNG20cnIzW7Q27KGyx-T3Ye2ZsrUDd8fFHDXlns2Gjpky0xzE=w2000-h2000-n-nu',
  'Minimax Hailuo': 'https://hailuoai.video/static/media/hailuo-og.png',
  'ChatGPT': 'https://images.openai.com/blob/a2e49de2-ba5b-4869-9c2d-db3b4b5571c4/chatgpt.jpg',
  'Claude': 'https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F1301d3e9e10dce1ad8eab43c41f24da3c584df9e-2880x1620.png&w=3840&q=75',
  'Perplexity': 'https://www.perplexity.ai/og-card.png',
  'Grok': 'https://x.ai/og-image.png',
  'BloombergGPT': 'https://assets.bbhub.io/company/sites/51/2023/03/Bloomberg_GPT_Featured.png',
  'Composer': 'https://cdn.prod.website-files.com/635c4eeb78332f7971255095/64dc1cb3e0e55567e5e8e5f2_Composer-OG.png',
  'Midjourney': 'https://cdn.midjourney.com/e4aa4534-4160-4a84-8b8b-264248c30d83/0_0.webp',
  'DALL-E 3': 'https://images.openai.com/blob/5927e8dc-0c9d-4c64-b927-7a0d4b80083f/dall-e-3.jpg',
  'Ideogram 2.0': 'https://ideogram.ai/assets/images/ideogram-og.png',
  'AIVA': 'https://www.aiva.ai/assets/img/workflows/create.png',
  'Rytr': 'https://rytr.me/images/hero.gif',
  'Fitbod': 'https://cdn.fitbod.me/images/og-image.png',
  'MyFitnessPal': 'https://www.myfitnesspal.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fhero-phone.webp&w=750&q=75',
  'FitnessAI': 'https://cdn.prod.website-files.com/5c34b1d990599d63c8b3e892/699cd35ec40e48ec88dc184c_bg-img-creators-page-hero.webp',
  'Quizlet': 'https://assets.quizlet.com/a/j/dist/i/share/quizlet-og.png',
  'StudyFetch': 'https://www.studyfetch.com/og-image.png',
}

let filled = 0

// Fill newThisWeek
for (const tool of data.newThisWeek || []) {
  if (!tool.preview && knownPreviews[tool.name]) {
    tool.preview = knownPreviews[tool.name]
    filled++
  }
}

// Fill categories
for (const cat of data.categories) {
  for (const tool of cat.tools) {
    if (!tool.preview && knownPreviews[tool.name]) {
      tool.preview = knownPreviews[tool.name]
      filled++
    }
  }
}

writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + '\n')
console.log(`Filled ${filled} missing previews.`)

// Check remaining
const still = []
for (const t of data.newThisWeek || []) { if (!t.preview) still.push(t.name) }
for (const c of data.categories) { for (const t of c.tools) { if (!t.preview) still.push(t.name) } }
if (still.length) console.log('Still missing:', still.join(', '))
else console.log('All tools have previews!')
