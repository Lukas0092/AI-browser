/**
 * One-time script: adds `pros` and `cons` arrays to every tool in data.json.
 * Derives bullets heuristically from existing description, specialty, and pricing fields.
 *
 * Usage:  node scripts/add-detail-fields.js
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_PATH = join(__dirname, '..', 'public', 'data.json')

const data = JSON.parse(readFileSync(DATA_PATH, 'utf-8'))

/* ── Keyword-based pro extractors ── */

function extractPros(tool) {
  const pros = []
  const desc = (tool.description || '').toLowerCase()
  const spec = (tool.specialty || '').toLowerCase()
  const name = tool.name

  // Pricing pros
  if (tool.isFree) {
    pros.push('Completely free to use')
  } else if (tool.hasFreeTier) {
    pros.push('Generous free tier available')
  }

  // Quality / capability keywords
  if (/4k|high.?res|hd|ultra/i.test(desc + spec)) pros.push('High-resolution output quality')
  if (/real.?time|instant|fast|speed|quick/i.test(desc + spec)) pros.push('Fast, real-time processing')
  if (/open.?source/i.test(desc)) pros.push('Open-source and community-driven')
  if (/api|integrate|plugin|extension/i.test(desc)) pros.push('API and integration support')
  if (/enterprise|team|collaborat/i.test(desc)) pros.push('Built for team collaboration')
  if (/multilingual|language|translat/i.test(desc + spec) && !/programming/i.test(desc)) pros.push('Multilingual support')
  if (/custom|personali[sz]/i.test(desc + spec)) pros.push('Highly customizable output')
  if (/no.?code|plain english|natural language/i.test(desc + spec)) pros.push('No coding skills required')
  if (/profession|studio|production.?ready/i.test(desc + spec)) pros.push('Professional-grade results')
  if (/privacy|secure|encrypt/i.test(desc)) pros.push('Strong privacy and security focus')
  if (/browser|web.?based|cloud/i.test(desc + spec)) pros.push('Works entirely in the browser')

  // Derive a specialty-based pro
  if (spec && pros.length < 5) {
    const specPro = capitalizeFirst(spec.length > 60 ? spec.slice(0, 57) + '...' : spec)
    pros.push(specPro)
  }

  // Ensure minimum 3 pros
  const fillers = [
    'Active development with regular updates',
    'Intuitive, easy-to-learn interface',
    'Growing community and ecosystem',
    'Clean, modern user experience',
  ]
  let fi = hashName(name) % fillers.length
  while (pros.length < 3) {
    pros.push(fillers[fi % fillers.length])
    fi++
  }

  // Cap at 4
  return [...new Set(pros)].slice(0, 4)
}

/* ── Keyword-based con extractors ── */

function extractCons(tool) {
  const cons = []
  const desc = (tool.description || '').toLowerCase()
  const pricing = (tool.pricing || '').toLowerCase()

  // Pricing cons
  if (!tool.isFree && !tool.hasFreeTier) {
    cons.push('No free tier available')
  }
  if (/\$[5-9]\d+|\$[1-9]\d{2,}/i.test(pricing)) {
    cons.push('Premium plans can be expensive')
  }
  if (/enterprise|custom pricing|contact/i.test(pricing)) {
    cons.push('Enterprise pricing not transparent')
  }

  // Limitation keywords
  if (/limit|cap|restrict|quota/i.test(desc + pricing)) cons.push('Usage limits on lower tiers')
  if (/beta|early access|preview/i.test(desc)) cons.push('Still in beta / early access')
  if (/discord only|waitlist/i.test(desc)) cons.push('Access can be limited or waitlisted')
  if (/learning curve|complex|advanced/i.test(desc)) cons.push('Steep learning curve for beginners')

  // Deterministic fillers based on tool name hash
  const fillers = [
    'Requires stable internet connection',
    'Output may need manual refinement',
    'Limited offline functionality',
    'Can be resource-intensive for large projects',
    'Occasional inconsistency in results',
  ]
  let fi = hashName(tool.name) % fillers.length
  while (cons.length < 2) {
    const candidate = fillers[fi % fillers.length]
    if (!cons.includes(candidate)) cons.push(candidate)
    fi++
  }

  return [...new Set(cons)].slice(0, 3)
}

/* ── Helpers ── */

function capitalizeFirst(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function hashName(name) {
  let h = 0
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/* ── Process all tool arrays ── */

function processTool(tool) {
  if (!tool.pros) tool.pros = extractPros(tool)
  if (!tool.cons) tool.cons = extractCons(tool)
}

let count = 0

// newThisWeek
data.newThisWeek.forEach(t => { processTool(t); count++ })

// allRounders
if (data.allRounders) data.allRounders.forEach(t => { processTool(t); count++ })

// categories
data.categories.forEach(cat => {
  cat.tools.forEach(t => { processTool(t); count++ })
})

// collections (if any)
if (data.collections) {
  data.collections.forEach(col => {
    if (col.tools) col.tools.forEach(t => { processTool(t); count++ })
  })
}

writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + '\n', 'utf-8')
console.log(`Done – added pros/cons to ${count} tools.`)
