import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import { spawn, execSync } from 'child_process'

const CATEGORIES = [
  { id: 'video', name: 'Video', color: '#ff6b6b' },
  { id: 'code', name: 'Code', color: '#4ecdc4' },
  { id: 'chat', name: 'Chat', color: '#a78bfa' },
  { id: 'finance', name: 'Finance', color: '#f59e0b' },
  { id: 'image', name: 'Image', color: '#ec4899' },
  { id: 'music', name: 'Music', color: '#06b6d4' },
  { id: 'writing', name: 'Writing', color: '#10b981' },
  { id: 'productivity', name: 'Productivity', color: '#8b5cf6' },
  { id: 'fitness', name: 'Fitness', color: '#ef4444' },
  { id: 'school', name: 'School', color: '#f97316' },
  { id: '3d', name: '3D', color: '#f472b6' },
  { id: 'voice', name: 'Voice', color: '#14b8a6' },
  { id: 'research', name: 'Research', color: '#6366f1' },
  { id: 'design', name: 'Design', color: '#f43f5e' },
  { id: 'marketing', name: 'Marketing', color: '#84cc16' },
]

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

function findClaudeCliJs() {
  const candidates = []
  try {
    const prefix = execSync('npm prefix -g', { encoding: 'utf-8' }).trim()
    candidates.push(join(prefix, 'node_modules', '@anthropic-ai', 'claude-code', 'cli.js'))
  } catch {}
  if (process.env.APPDATA) {
    candidates.push(join(process.env.APPDATA, 'npm', 'node_modules', '@anthropic-ai', 'claude-code', 'cli.js'))
  }
  for (const p of candidates) {
    if (existsSync(p)) return p
  }
  return null
}

function buildPrompt(userRequest) {
  const cats = CATEGORIES.map(c => c.id).join(', ')
  return `Generate 1-3 AI tool entries as a JSON array. Each tool needs: name, tagline, description (2-4 sentences), isFree (bool), hasFreeTier (bool), pricing, specialty, website (plausible .com/.ai/.io), rank (always 1), preview (always empty string), categoryId, pros (array of 3-4 strings), cons (array of 2-3 strings). Available categories: ${cats}. Use creative but realistic names. The user wants: ${userRequest}. Return ONLY the JSON array.`
}

function buildRecommendPrompt(query, tools) {
  const toolSummary = tools.map(t =>
    `- ${t.name} [${t.category}]: ${t.tagline} | ${t.pricing} | Specialty: ${t.specialty}`
  ).join('\n')

  return `The user is looking for: "${query}"

Here are AI tools from our database that might be relevant:
${toolSummary}

Research which of these tools are the best and most popular for the user's needs. Consider real-world popularity, user reviews, feature quality, and value. Return a ranked JSON array of the top 3-5 best matches. Each entry needs: "name" (exact name from the list above), "category" (the category in brackets), "reason" (1 sentence explaining why this is a good pick).

If fewer than 3 tools are relevant, include only the relevant ones. Return ONLY the JSON array, no other text.`
}

function parseAndSaveTools(output) {
  const stripped = output.replace(/```json?\s*/g, '').replace(/```/g, '').trim()
  const jsonMatch = stripped.match(/\[[\s\S]*\]/)
  if (!jsonMatch) return { error: 'Could not find JSON in Claude response' }

  let tools
  try {
    tools = JSON.parse(jsonMatch[0])
  } catch (e) {
    return { error: 'Invalid JSON: ' + e.message }
  }
  if (!Array.isArray(tools)) tools = [tools]

  const dataPath = resolve(process.cwd(), 'public', 'data.json')
  const data = JSON.parse(readFileSync(dataPath, 'utf-8'))
  const added = []

  // Ensure aiGenerated array exists
  if (!data.aiGenerated) data.aiGenerated = []

  for (const tool of tools) {
    const catId = tool.categoryId || 'productivity'
    delete tool.categoryId
    const cat = data.categories.find(c => c.id === catId)
    if (!cat) continue
    if (cat.tools.some(t => t.name.toLowerCase() === tool.name.toLowerCase())) continue
    tool.rank = cat.tools.length + 1
    if (!tool.preview) tool.preview = ''
    if (!tool.pros) tool.pros = []
    if (!tool.cons) tool.cons = []
    cat.tools.push(tool)

    // Also track in the aiGenerated collection
    const ref = { name: tool.name, category: cat.id }
    if (!data.aiGenerated.some(r => r.name === tool.name)) {
      data.aiGenerated.push(ref)
    }

    added.push({ tool, category: { id: cat.id, name: cat.name, color: cat.color } })
  }

  if (added.length > 0) {
    writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
  }

  return { added }
}

function aiGeneratePlugin() {
  const youtubeCache = new Map()

  return {
    name: 'ai-generate',
    configureServer(server) {
      // YouTube video ID lookup
      server.middlewares.use('/api/youtube', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }

        const url = new URL(req.url, 'http://localhost')
        const query = url.searchParams.get('q')
        if (!query) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ videoId: null }))
          return
        }

        if (youtubeCache.has(query)) {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ videoId: youtubeCache.get(query) }))
          return
        }

        try {
          const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' review')}`
          const resp = await fetch(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
          })
          const html = await resp.text()
          const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/)
          const videoId = match ? match[1] : null
          youtubeCache.set(query, videoId)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ videoId }))
        } catch {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ videoId: null }))
        }
      })

      // Download all AI-generated tools as a JSON file
      server.middlewares.use('/api/export-generated', (req, res) => {
        const dataPath = resolve(process.cwd(), 'public', 'data.json')
        const data = JSON.parse(readFileSync(dataPath, 'utf-8'))
        const refs = data.aiGenerated || []

        // Resolve full tool objects
        const tools = []
        for (const ref of refs) {
          const cat = data.categories.find(c => c.id === ref.category)
          const tool = cat?.tools.find(t => t.name === ref.name)
          if (tool && cat) {
            tools.push({ ...tool, categoryId: cat.id, categoryName: cat.name })
          }
        }

        const output = JSON.stringify(tools, null, 2)
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Content-Disposition', 'attachment; filename="ai-generated-tools.json"')
        res.end(output)
      })

      // AI recommendation endpoint
      server.middlewares.use('/api/recommend', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }

        let body = ''
        for await (const chunk of req) body += chunk
        let parsed
        try { parsed = JSON.parse(body) } catch {
          res.statusCode = 400
          res.setHeader('Content-Type', 'text/plain')
          res.end('Invalid JSON')
          return
        }

        const { query, tools } = parsed
        if (!query) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'text/plain')
          res.end('Missing query')
          return
        }

        const cliPath = findClaudeCliJs()
        if (!cliPath) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'text/plain')
          res.end('Claude Code CLI not found')
          return
        }

        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Transfer-Encoding', 'chunked')

        const fullPrompt = buildRecommendPrompt(query, tools || [])
        const send = (obj) => { res.write(JSON.stringify(obj) + '\n') }

        send({ type: 'cmd', text: `> Researching best tools for "${query.slice(0, 50)}..."` })

        const proc = spawn(process.execPath, [cliPath, '-p', fullPrompt, '--output-format', 'text'], {
          windowsHide: true,
          env: { ...process.env },
          stdio: ['ignore', 'pipe', 'pipe'],
        })

        let fullOutput = ''

        proc.stdout.on('data', d => {
          const text = d.toString()
          fullOutput += text
          send({ type: 'stdout', text })
        })

        proc.stderr.on('data', d => {
          send({ type: 'stderr', text: d.toString() })
        })

        proc.on('error', err => {
          send({ type: 'error', error: err.message })
          res.end()
        })

        proc.on('close', code => {
          clearTimeout(timer)
          if (code !== 0) {
            send({ type: 'error', error: `Process exited with code ${code}` })
          } else {
            // Parse recommendations from output
            const stripped = fullOutput.replace(/```json?\s*/g, '').replace(/```/g, '').trim()
            const jsonMatch = stripped.match(/\[[\s\S]*\]/)
            if (jsonMatch) {
              try {
                const results = JSON.parse(jsonMatch[0])
                send({ type: 'recommendations', results: Array.isArray(results) ? results : [results] })
              } catch {
                send({ type: 'error', error: 'Could not parse recommendations' })
              }
            } else {
              send({ type: 'error', error: 'No recommendations found in response' })
            }
          }
          res.end()
        })

        const timer = setTimeout(() => {
          proc.kill()
          send({ type: 'error', error: 'Timed out after 3 minutes' })
          res.end()
        }, 180_000)
      })

      server.middlewares.use('/api/generate', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }

        let body = ''
        for await (const chunk of req) body += chunk
        let parsed
        try { parsed = JSON.parse(body) } catch {
          res.statusCode = 400
          res.setHeader('Content-Type', 'text/plain')
          res.end('Invalid JSON')
          return
        }

        const { prompt } = parsed
        if (!prompt) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'text/plain')
          res.end('Missing prompt')
          return
        }

        const cliPath = findClaudeCliJs()
        if (!cliPath) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'text/plain')
          res.end('Claude Code CLI not found')
          return
        }

        // Stream response — newline-delimited JSON
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Transfer-Encoding', 'chunked')

        const fullPrompt = buildPrompt(prompt)

        // Send the command line being run
        const send = (obj) => { res.write(JSON.stringify(obj) + '\n') }

        send({ type: 'cmd', text: `> claude -p "${prompt.slice(0, 60)}..."` })

        const proc = spawn(process.execPath, [cliPath, '-p', fullPrompt, '--output-format', 'text'], {
          windowsHide: true,
          env: { ...process.env },
          stdio: ['ignore', 'pipe', 'pipe'],
        })

        let fullOutput = ''

        proc.stdout.on('data', d => {
          const text = d.toString()
          fullOutput += text
          send({ type: 'stdout', text })
        })

        proc.stderr.on('data', d => {
          send({ type: 'stderr', text: d.toString() })
        })

        proc.on('error', err => {
          send({ type: 'error', error: err.message })
          res.end()
        })

        proc.on('close', async (code) => {
          clearTimeout(timer)
          if (code !== 0) {
            send({ type: 'error', error: `Process exited with code ${code}` })
            res.end()
          } else {
            const result = parseAndSaveTools(fullOutput)
            if (result.error) {
              send({ type: 'error', error: result.error })
              res.end()
            } else {
              // Fetch preview images for newly added tools
              if (result.added?.length > 0) {
                const dataPath = resolve(process.cwd(), 'public', 'data.json')
                const data = JSON.parse(readFileSync(dataPath, 'utf-8'))
                let updated = false

                await Promise.all(result.added.map(async ({ tool }) => {
                  if (!tool.preview && tool.website) {
                    const img = await getOgImage(tool.website)
                    if (img) {
                      tool.preview = img
                      for (const cat of data.categories) {
                        const found = cat.tools.find(t => t.name === tool.name)
                        if (found) { found.preview = img; updated = true; break }
                      }
                    }
                  }
                }))

                if (updated) {
                  writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
                }
              }

              send({ type: 'done', added: result.added })
              res.end()
            }
          }
        })

        const timer = setTimeout(() => {
          proc.kill()
          send({ type: 'error', error: 'Timed out after 5 minutes' })
          res.end()
        }, 300_000)
      })
    },
  }
}

export default defineConfig(({ command }) => ({
  plugins: [react(), ...(command === 'serve' ? [aiGeneratePlugin()] : [])],
  base: command === 'build' ? '/ai-tracker/' : '/',
}))
