import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DATA_PATH = join(__dirname, '..', 'public', 'data.json')

async function updateData() {
  console.log('Reading current data.json...')
  const data = JSON.parse(readFileSync(DATA_PATH, 'utf-8'))

  // Update the lastUpdated timestamp
  const today = new Date().toISOString().split('T')[0]
  data.lastUpdated = today
  console.log(`Updated lastUpdated to ${today}`)

  // --- Extend here ---
  // You can add API calls to fetch trending data from sources like:
  //
  // 1. Product Hunt API (requires API key):
  //    const response = await fetch('https://api.producthunt.com/v2/api/graphql', { ... })
  //
  // 2. RSS feeds (e.g., TechCrunch AI, The Verge AI):
  //    const feed = await fetch('https://techcrunch.com/category/artificial-intelligence/feed/')
  //
  // 3. GitHub trending (no API key needed):
  //    const response = await fetch('https://api.github.com/search/repositories?q=topic:ai&sort=stars')
  //
  // For each source, parse the data and update the relevant category's tools array.
  // Example:
  //   data.categories.find(c => c.id === 'code').tools = updatedCodeTools

  // Write the updated data back
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + '\n')
  console.log('data.json updated successfully!')
}

updateData().catch(err => {
  console.error('Failed to update data:', err)
  process.exit(1)
})
