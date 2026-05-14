// Auto-fetches og:image previews for any tools missing one in data.json
// Runs automatically before dev/build via package.json pre-scripts
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_PATH = join(__dirname, '..', 'public', 'data.json')

async function getOgImage(url) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      redirect: 'follow',
    })
    clearTimeout(timeout)
    const html = await res.text()

    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
    if (ogMatch) return ogMatch[1]

    const twMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i)
    if (twMatch) return twMatch[1]

    return null
  } catch {
    return null
  }
}

async function main() {
  const data = JSON.parse(readFileSync(DATA_PATH, 'utf-8'))

  // Collect all tools missing previews
  const missing = []
  for (const tool of data.newThisWeek || []) {
    if (!tool.preview) missing.push(tool)
  }
  for (const cat of data.categories) {
    for (const tool of cat.tools) {
      if (!tool.preview) missing.push(tool)
    }
  }

  if (missing.length === 0) {
    console.log('All tools have preview images.')
    return
  }

  console.log(`Fetching previews for ${missing.length} new tool(s)...`)
  let found = 0

  for (const tool of missing) {
    const img = await getOgImage(tool.website)
    if (img && img.startsWith('http')) {
      tool.preview = img
      found++
      console.log(`  + ${tool.name}`)
    }
  }

  if (found > 0) {
    writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + '\n')
    console.log(`Saved ${found} new preview(s).`)
  } else {
    console.log('No new previews found (some sites block fetching - add manually).')
  }
}

main()
