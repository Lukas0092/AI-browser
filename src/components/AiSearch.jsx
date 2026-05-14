import { useState, useRef, useEffect } from 'react'

/* ── Live terminal panel ── */

function Terminal({ lines, done }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [lines])

  return (
    <div className="ai-terminal">
      <div className="ai-terminal-header">
        <span className="ai-terminal-dot red" />
        <span className="ai-terminal-dot yellow" />
        <span className="ai-terminal-dot green" />
        <span className="ai-terminal-title">Claude Code</span>
      </div>
      <div className="ai-terminal-body">
        {lines.map((line, i) => (
          <span key={i}>{line}</span>
        ))}
        {!done && <span className="ai-terminal-cursor" />}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

const SUGGESTIONS = [
  'Best free video editors',
  'AI tools for coding',
  'Image generation on a budget',
  'Writing assistant for marketing',
  'Music creation tools',
  'Voice cloning tools',
  'Free AI chatbots',
  '3D modeling with AI',
]

const GENERATE_SUGGESTIONS = [
  'Add a finance tool that manages AI agents',
  'Create a coding assistant for game dev',
  'I need a new AI for 3D architecture',
  'Add a fitness AI that builds meal plans',
]

/* ── Intent detection ── */

const GENERATE_SIGNALS = [
  'add', 'create', 'generate', 'make', 'build', 'i want new', 'i need new',
  'i want a', 'i need a', 'can you add', 'can you make', 'can you create',
  'new tool', 'new ai', 'invent', 'come up with',
]

function isGenerateIntent(query) {
  const lower = query.toLowerCase()
  return GENERATE_SIGNALS.some(s => lower.includes(s))
}

/* ── Keyword search engine ── */

function getAllTools(data) {
  const tools = []
  const seen = new Set()

  const add = (tool, cat) => {
    if (seen.has(tool.name)) return
    seen.add(tool.name)
    tools.push({ tool, category: cat })
  }

  for (const entry of data.newThisWeek || []) {
    const cat = { id: entry.categoryId, name: entry.categoryLabel, color: entry.categoryColor }
    add(entry, cat)
  }
  for (const cat of data.categories || []) {
    for (const t of cat.tools || []) {
      add(t, cat)
    }
  }
  return tools
}

function scoreMatch(tool, category, tokens) {
  let score = 0
  const name = tool.name.toLowerCase()
  const catName = (category.name || '').toLowerCase()
  const desc = (tool.description || '').toLowerCase()
  const spec = (tool.specialty || '').toLowerCase()
  const pricing = (tool.pricing || '').toLowerCase()

  for (const tok of tokens) {
    if (name.includes(tok)) score += 10
    if (catName.includes(tok)) score += 6
    if (spec.includes(tok)) score += 4
    if (desc.includes(tok)) score += 2
    if (pricing.includes(tok)) score += 1
  }

  const wantsFree = tokens.some(t =>
    ['free', 'budget', 'cheap', 'no-cost', 'affordable'].includes(t)
  )
  if (wantsFree) {
    if (tool.isFree) score += 8
    else if (tool.hasFreeTier) score += 4
    else score -= 3
  }

  return score
}

function searchTools(data, query) {
  const tokens = query.toLowerCase().replace(/[^a-z0-9\s-]/g, '').split(/\s+/).filter(Boolean)
  if (!tokens.length) return []

  const allTools = getAllTools(data)
  const scored = allTools
    .map(({ tool, category }) => ({
      tool,
      category,
      score: scoreMatch(tool, category, tokens),
    }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, 6)
}

/* ── Follow-up preference questions ── */

const FOLLOW_UPS = [
  {
    keywords: ['video', 'edit', 'clip', 'movie', 'film'],
    question: 'What kind of video work?',
    options: ['Generate videos from text', 'Edit existing footage', 'Create AI avatars', 'Animate images'],
    mapped: ['AI video generation', 'video editing AI', 'AI avatar video', 'AI animation'],
  },
  {
    keywords: ['image', 'picture', 'photo', 'art', 'draw', 'illustration'],
    question: 'What style are you after?',
    options: ['Photorealistic images', 'Artistic / creative', 'UI & design assets', 'Edit & enhance photos'],
    mapped: ['photorealistic image generation', 'artistic image AI', 'design asset generation', 'AI photo editing'],
  },
  {
    keywords: ['code', 'coding', 'program', 'develop', 'app', 'website', 'software'],
    question: 'What do you need help with?',
    options: ['Write & edit code', 'Build full apps', 'Generate UI components', 'Automate workflows'],
    mapped: ['AI code editor', 'full-stack app generation', 'UI component generation', 'AI automation'],
  },
  {
    keywords: ['write', 'writing', 'content', 'copy', 'blog', 'article', 'marketing'],
    question: 'What kind of writing?',
    options: ['Marketing copy', 'Long-form articles', 'Academic / research', 'General assistant'],
    mapped: ['marketing content AI', 'AI article writer', 'AI research writing', 'AI writing assistant'],
  },
  {
    keywords: ['music', 'song', 'audio', 'sound', 'beat'],
    question: 'What audio work?',
    options: ['Generate full songs', 'Create beats / instrumentals', 'Voice & speech', 'Sound effects'],
    mapped: ['AI song generation', 'AI music production', 'AI voice synthesis', 'AI sound effects'],
  },
]

function findFollowUp(query) {
  const lower = query.toLowerCase()
  return FOLLOW_UPS.find(fu =>
    fu.keywords.some(kw => lower.includes(kw))
  )
}

/* ── Component ── */

function AiSearch({ data, onSelectTool, onDataRefresh }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingFollowUp, setPendingFollowUp] = useState(null)
  const [mode, setMode] = useState('search') // 'search' | 'generate'
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  const handleOpen = () => {
    setOpen(true)
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        type: 'text',
        content: "Hi! I can search existing tools or generate brand new ones with AI. What do you need?",
      }])
    }
  }

  const handleClose = () => setOpen(false)

  const switchMode = (newMode) => {
    setMode(newMode)
    setMessages([{
      role: 'assistant',
      type: 'text',
      content: newMode === 'generate'
        ? "Generate mode — I'll use Claude Code on your machine to create new tools and save them. Describe what you want!"
        : "Search mode — describe what you're looking for and I'll find matching tools.",
    }])
    setPendingFollowUp(null)
  }

  /* ── Generate via Claude CLI (streamed) ── */

  const doGenerate = async (prompt) => {
    setLoading(true)

    // Insert a terminal message that we'll update live
    const terminalId = Date.now()
    setMessages(prev => [...prev, {
      role: 'assistant',
      type: 'terminal',
      id: terminalId,
      lines: [],
      done: false,
    }])

    const appendLine = (text) => {
      setMessages(prev => prev.map(m =>
        m.id === terminalId ? { ...m, lines: [...m.lines, text] } : m
      ))
    }

    const markDone = () => {
      setMessages(prev => prev.map(m =>
        m.id === terminalId ? { ...m, done: true } : m
      ))
    }

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let finalAdded = null
      let finalError = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n')
        buffer = parts.pop() // keep incomplete line in buffer

        for (const line of parts) {
          if (!line.trim()) continue
          try {
            const msg = JSON.parse(line)
            if (msg.type === 'cmd') appendLine(msg.text)
            if (msg.type === 'stdout') appendLine(msg.text)
            if (msg.type === 'stderr') appendLine(msg.text)
            if (msg.type === 'done') finalAdded = msg.added
            if (msg.type === 'error') finalError = msg.error
          } catch {}
        }
      }

      markDone()

      if (finalError) {
        setMessages(prev => [...prev, {
          role: 'assistant', type: 'error', content: finalError,
        }])
      } else if (finalAdded?.length > 0) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          type: 'generated',
          content: `Created ${finalAdded.length} new tool${finalAdded.length > 1 ? 's' : ''} and added to the tracker:`,
          results: finalAdded,
        }])
        if (onDataRefresh) onDataRefresh()
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant', type: 'text',
          content: "Claude generated tools but they were duplicates. Try something different.",
        }])
      }
    } catch (err) {
      markDone()
      setMessages(prev => [...prev, {
        role: 'assistant', type: 'error', content: `Connection error: ${err.message}`,
      }])
    }

    setLoading(false)
  }

  /* ── AI Recommend via Claude CLI (streamed) ── */

  const doRecommend = async (query) => {
    setLoading(true)

    // Gather relevant tools as context
    const allTools = getAllTools(data)
    const tokens = query.toLowerCase().replace(/[^a-z0-9\s-]/g, '').split(/\s+/).filter(Boolean)
    // Send tools that have at least some relevance, up to 30
    const relevant = allTools
      .map(({ tool, category }) => ({
        name: tool.name,
        category: category.name,
        tagline: tool.tagline || '',
        pricing: tool.pricing || '',
        specialty: tool.specialty || '',
        score: scoreMatch(tool, category, tokens),
      }))
      .filter(t => t.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30)

    // If no relevant tools, send all tools (limited)
    const toolContext = relevant.length > 0 ? relevant : allTools.slice(0, 30).map(({ tool, category }) => ({
      name: tool.name,
      category: category.name,
      tagline: tool.tagline || '',
      pricing: tool.pricing || '',
      specialty: tool.specialty || '',
    }))

    const terminalId = Date.now()
    setMessages(prev => [...prev, {
      role: 'assistant',
      type: 'terminal',
      id: terminalId,
      lines: [],
      done: false,
    }])

    const appendLine = (text) => {
      setMessages(prev => prev.map(m =>
        m.id === terminalId ? { ...m, lines: [...m.lines, text] } : m
      ))
    }

    const markDone = () => {
      setMessages(prev => prev.map(m =>
        m.id === terminalId ? { ...m, done: true } : m
      ))
    }

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, tools: toolContext }),
      })

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let finalRecs = null
      let finalError = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n')
        buffer = parts.pop()

        for (const line of parts) {
          if (!line.trim()) continue
          try {
            const msg = JSON.parse(line)
            if (msg.type === 'cmd') appendLine(msg.text)
            if (msg.type === 'stdout') appendLine(msg.text)
            if (msg.type === 'stderr') appendLine(msg.text)
            if (msg.type === 'recommendations') finalRecs = msg.results
            if (msg.type === 'error') finalError = msg.error
          } catch {}
        }
      }

      markDone()

      if (finalError) {
        setMessages(prev => [...prev, {
          role: 'assistant', type: 'error', content: finalError,
        }])
      } else if (finalRecs?.length > 0) {
        // Resolve recommendations against database
        const allToolsMap = getAllTools(data)
        const resolved = finalRecs.map((rec, idx) => {
          const match = allToolsMap.find(({ tool }) =>
            tool.name.toLowerCase() === rec.name.toLowerCase()
          )
          return {
            rank: idx + 1,
            name: rec.name,
            reason: rec.reason || '',
            category: rec.category || '',
            tool: match?.tool || null,
            categoryObj: match?.category || null,
          }
        })

        setMessages(prev => [...prev, {
          role: 'assistant',
          type: 'recommendations',
          content: `Here are the best tools for "${query}":`,
          results: resolved,
        }])
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant', type: 'text',
          content: "Couldn't get recommendations. Try a different query.",
        }])
      }
    } catch (err) {
      markDone()
      setMessages(prev => [...prev, {
        role: 'assistant', type: 'error', content: `Connection error: ${err.message}`,
      }])
    }

    setLoading(false)
  }

  /* ── Search existing tools ── */

  const doSearch = (query) => {
    const results = searchTools(data, query)
    if (results.length === 0) {
      setMessages(prev => [...prev,
        {
          role: 'assistant',
          type: 'text',
          content: "No matches found. Want me to generate a new tool? Just say \"add\" or \"create\" followed by what you want.",
        },
        {
          role: 'assistant',
          type: 'ai-recommend-offer',
          query,
        },
      ])
    } else {
      setMessages(prev => [...prev,
        {
          role: 'assistant',
          type: 'results',
          content: 'Here are my top picks:',
          results,
        },
        {
          role: 'assistant',
          type: 'ai-recommend-offer',
          query,
        },
      ])
    }
  }

  /* ── Handle recommend button click ── */

  const handleRecommend = (query) => {
    setMessages(prev => [...prev, { role: 'user', type: 'text', content: `Research the best tools for: ${query}` }])
    doRecommend(query)
  }

  /* ── Process user input ── */

  const processQuery = (query) => {
    setMessages(prev => [...prev, { role: 'user', type: 'text', content: query }])
    setPendingFollowUp(null)

    // If in generate mode or query has generate intent → generate
    if (mode === 'generate' || isGenerateIntent(query)) {
      doGenerate(query)
      return
    }

    // Search mode: check for follow-up opportunity
    const fu = findFollowUp(query)
    if (fu) {
      setPendingFollowUp({ query, ...fu })
      setMessages(prev => [...prev, {
        role: 'assistant',
        type: 'followup',
        content: fu.question,
        options: fu.options,
      }])
      return
    }

    doSearch(query)
  }

  const handleFollowUpChoice = (option, index) => {
    if (!pendingFollowUp) return
    const refined = pendingFollowUp.mapped[index]
    setMessages(prev => [...prev, { role: 'user', type: 'text', content: option }])
    setPendingFollowUp(null)
    doSearch(refined)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const q = input.trim()
    if (!q || loading) return
    setInput('')
    processQuery(q)
  }

  const handleSuggestion = (text) => {
    if (loading) return
    processQuery(text)
  }

  const handleToolClick = (tool, category) => {
    setOpen(false)
    onSelectTool(tool, category)
  }

  const handleSaveTool = (e, tool, category) => {
    e.stopPropagation()
    const data = JSON.stringify({ ...tool, categoryId: category.id, categoryName: category.name }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tool.name.replace(/\s+/g, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const showSuggestions = messages.length <= 1

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button className="ai-fab" onClick={handleOpen} aria-label="AI Search">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L9 9H2l6 4.5L5.5 22 12 17l6.5 5-2.5-8.5L22 9h-7z" />
          </svg>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="ai-panel">
          <div className="ai-panel-header">
            <div className="ai-panel-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L9 9H2l6 4.5L5.5 22 12 17l6.5 5-2.5-8.5L22 9h-7z" />
              </svg>
              AI Assistant
            </div>
            <button className="ai-panel-close" onClick={handleClose}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Mode toggle */}
          <div className="ai-mode-toggle">
            <button
              className={`ai-mode-btn ${mode === 'search' ? 'active' : ''}`}
              onClick={() => switchMode('search')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Search
            </button>
            <button
              className={`ai-mode-btn ${mode === 'generate' ? 'active' : ''}`}
              onClick={() => switchMode('generate')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L9 9H2l6 4.5L5.5 22 12 17l6.5 5-2.5-8.5L22 9h-7z" />
              </svg>
              Generate
            </button>
          </div>

          <div className="ai-panel-chat">
            {messages.map((msg, i) => (
              <div key={i} className={`ai-msg ai-msg-${msg.role}`}>
                {msg.type === 'text' && <p>{msg.content}</p>}

                {msg.type === 'terminal' && (
                  <Terminal lines={msg.lines} done={msg.done} />
                )}

                {msg.type === 'error' && (
                  <p className="ai-error">{msg.content}</p>
                )}

                {msg.type === 'followup' && (
                  <>
                    <p>{msg.content}</p>
                    <div className="ai-options">
                      {msg.options.map((opt, j) => (
                        <button
                          key={j}
                          className="ai-option-btn"
                          onClick={() => handleFollowUpChoice(opt, j)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {msg.type === 'ai-recommend-offer' && (
                  <button
                    className="ai-recommend-btn"
                    onClick={() => handleRecommend(msg.query)}
                    disabled={loading}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L9 9H2l6 4.5L5.5 22 12 17l6.5 5-2.5-8.5L22 9h-7z" />
                    </svg>
                    Want AI to research the best tools for this?
                  </button>
                )}

                {msg.type === 'recommendations' && (
                  <>
                    <p>{msg.content}</p>
                    <div className="ai-results">
                      {msg.results.map((rec) => (
                        <button
                          key={rec.name}
                          className={`ai-result-card${rec.tool ? '' : ' ai-result-external'}`}
                          onClick={() => rec.tool && rec.categoryObj && handleToolClick(rec.tool, rec.categoryObj)}
                          style={rec.categoryObj ? { '--cat-color': rec.categoryObj.color } : {}}
                        >
                          <span className="ai-result-rank">#{rec.rank}</span>
                          <span className="ai-result-info">
                            <span className="ai-result-name">{rec.name}</span>
                            {rec.reason && <span className="ai-result-reason">{rec.reason}</span>}
                          </span>
                          <span className="ai-result-cat">{rec.categoryObj?.name || rec.category}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {(msg.type === 'results' || msg.type === 'generated') && (
                  <>
                    <p>{msg.content}</p>
                    {msg.type === 'generated' && (
                      <div className="ai-generated-row">
                        <p className="ai-generated-badge">Added to data.json</p>
                        <a
                          className="ai-save-all-btn"
                          href="/api/export-generated"
                          download="ai-generated-tools.json"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          Save all
                        </a>
                      </div>
                    )}
                    <div className="ai-results">
                      {msg.results.map(({ tool, category }) => (
                        <button
                          key={tool.name}
                          className="ai-result-card"
                          onClick={() => handleToolClick(tool, category)}
                          style={{ '--cat-color': category.color }}
                        >
                          <span className="ai-result-name">{tool.name}</span>
                          <span className="ai-result-cat">{category.name}</span>
                          <span className="ai-result-tag">
                            {tool.isFree ? 'Free' : tool.hasFreeTier ? 'Free Tier' : 'Paid'}
                          </span>
                          {msg.type === 'generated' && (
                            <span
                              className="ai-result-save"
                              onClick={(e) => handleSaveTool(e, tool, category)}
                              title="Save to PC"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}

            {showSuggestions && (
              <div className="ai-suggestions">
                <p className="ai-suggestions-label">
                  {mode === 'generate' ? 'Try creating:' : 'Try asking:'}
                </p>
                <div className="ai-chips">
                  {(mode === 'generate' ? GENERATE_SUGGESTIONS : SUGGESTIONS).map(s => (
                    <button key={s} className="ai-chip" onClick={() => handleSuggestion(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <form className="ai-panel-input" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              placeholder={mode === 'generate'
                ? 'Describe the AI tool you want to create...'
                : 'Describe what you need...'}
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading} aria-label="Send">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  )
}

export default AiSearch
