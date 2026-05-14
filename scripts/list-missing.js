import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
const d = JSON.parse(readFileSync(join(__dirname, '..', 'public', 'data.json'), 'utf-8'))
const missing = []
for (const t of d.newThisWeek || []) {
  if (!t.preview) missing.push(t.name + ' | ' + t.website)
}
for (const c of d.categories) {
  for (const t of c.tools) {
    if (!t.preview) missing.push(t.name + ' | ' + t.website)
  }
}
console.log('Missing previews (' + missing.length + '):')
missing.forEach(m => console.log('  ' + m))
