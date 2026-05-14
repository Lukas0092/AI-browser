// Auto-fetches og:image previews for any tools missing one in data.json
// Also validates existing preview URLs and replaces broken ones
// Runs automatically before dev/build via package.json pre-scripts
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_PATH = join(__dirname, '..', 'public', 'data.json')

async function isUrlReachable(url) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(url, {
      signal: controller.signal,
      method: 'HEAD',
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    })
    clearTimeout(timeout)
    return res.ok
  } catch {
    return false
  }
}

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

    // Site is reachable but has no meta image — use screenshot fallback
    return `https://image.thum.io/get/width/1280/crop/720/${url}`
  } catch {
    // Site unreachable — still try screenshot service (browser onError hides failures)
    if (url?.startsWith('http')) return `https://image.thum.io/get/width/1280/crop/720/${url}`
    return null
  }
}

async function main() {
  const data = JSON.parse(readFileSync(DATA_PATH, 'utf-8'))

  // Collect all tools (both missing and existing previews)
  const allTools = []
  for (const tool of data.newThisWeek || []) {
    allTools.push(tool)
  }
  for (const cat of data.categories) {
    for (const tool of cat.tools) {
      allTools.push(tool)
    }
  }

  // Split into missing and existing
  const missing = allTools.filter(t => !t.preview)
  const existing = allTools.filter(t => t.preview && !t.preview.includes('thum.io'))

  let changes = 0

  // 1. Fetch previews for tools that have none
  if (missing.length > 0) {
    console.log(`Fetching previews for ${missing.length} new tool(s)...`)
    for (const tool of missing) {
      const img = await getOgImage(tool.website)
      if (img && img.startsWith('http')) {
        tool.preview = img
        changes++
        console.log(`  + ${tool.name}`)
      }
    }
  }

  // 2. Validate existing preview URLs and replace broken ones
  if (existing.length > 0) {
    console.log(`Validating ${existing.length} existing preview(s)...`)
    // Check in parallel batches of 10
    for (let i = 0; i < existing.length; i += 10) {
      const batch = existing.slice(i, i + 10)
      const results = await Promise.all(
        batch.map(async (tool) => {
          const ok = await isUrlReachable(tool.preview)
          return { tool, ok }
        })
      )
      for (const { tool, ok } of results) {
        if (!ok) {
          const fresh = await getOgImage(tool.website)
          if (fresh && fresh.startsWith('http') && fresh !== tool.preview) {
            console.log(`  ~ ${tool.name} (replaced broken preview)`)
            tool.preview = fresh
            changes++
          }
        }
      }
    }
  }

  if (changes > 0) {
    writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + '\n')
    console.log(`Saved ${changes} preview update(s).`)
  } else {
    console.log('All previews up to date.')
  }
}

main()
