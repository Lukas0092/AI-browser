import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Header from './components/Header'
import CategoryNav from './components/CategoryNav'
import CategorySection from './components/CategorySection'
import HeroSection from './components/HeroSection'
import ToolDetail from './components/ToolDetail'
import AiSearch from './components/AiSearch'
import './App.css'

function App() {
  const [data, setData] = useState(null)
  const [activeCategory, setActiveCategory] = useState('newThisWeek')
  const [selectedTool, setSelectedTool] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const sectionRefs = useRef({})

  // Favorites state from localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ai-tracker-favorites')) || []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('ai-tracker-favorites', JSON.stringify(favorites))
  }, [favorites])

  const isFavorite = useCallback((toolName) => {
    return favorites.some(f => f.name === toolName)
  }, [favorites])

  const toggleFavorite = useCallback((toolName, categoryId) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.name === toolName)
      if (exists) return prev.filter(f => f.name !== toolName)
      return [...prev, { name: toolName, category: categoryId }]
    })
  }, [])

  const loadData = useCallback(() => {
    fetch(`${import.meta.env.BASE_URL}data.json?t=${Date.now()}`)
      .then(res => res.json())
      .then(json => setData(json))
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Helper: find a tool across all sources
  const findTool = (name, catId, source) => {
    if (source === 'newThisWeek') {
      const entry = (data.newThisWeek || []).find(t => t.name === name)
      if (entry) {
        const cat = { id: entry.categoryId, name: entry.categoryLabel, color: entry.categoryColor }
        return { tool: { ...entry, _category: cat }, category: cat }
      }
    }
    if (catId) {
      const cat = data.categories.find(c => c.id === catId)
      const tool = cat?.tools.find(t => t.name === name)
      if (tool && cat) return { tool: { ...tool, _category: cat }, category: cat }
    }
    // Fallback: search everywhere
    for (const cat of data.categories) {
      const tool = cat.tools.find(t => t.name === name)
      if (tool) return { tool: { ...tool, _category: cat }, category: cat }
    }
    return null
  }

  const resolvedNew = useMemo(() => {
    if (!data?.newThisWeek) return { hero: [], row: [], colors: [] }
    const all = data.newThisWeek.map(entry => {
      const category = { id: entry.categoryId, name: entry.categoryLabel, color: entry.categoryColor }
      const tool = { ...entry, _category: category }
      return { tool, category, heroDescription: entry.heroDescription }
    })
    const hero = all.filter(item => item.heroDescription)
    const colors = all.map(item => item.category.color)
    return { hero, row: all.map(i => i.tool), colors }
  }, [data])

  const resolvedAllRounders = useMemo(() => {
    if (!data) return { tools: [], colors: [] }
    const tools = []
    const colors = []
    for (const ref of (data.allRounders || [])) {
      const result = findTool(ref.name, ref.category)
      if (result) {
        tools.push(result.tool)
        colors.push(result.category.color)
      }
    }
    return { tools, colors }
  }, [data])

  const resolvedFavorites = useMemo(() => {
    if (!data || favorites.length === 0) return { tools: [], colors: [] }
    const tools = []
    const colors = []
    for (const ref of favorites) {
      const result = findTool(ref.name, ref.category)
      if (result) {
        tools.push(result.tool)
        colors.push(result.category.color)
      }
    }
    return { tools, colors }
  }, [data, favorites])

  const resolvedAiGenerated = useMemo(() => {
    if (!data?.aiGenerated?.length) return { tools: [], colors: [] }
    const tools = []
    const colors = []
    for (const ref of data.aiGenerated) {
      const result = findTool(ref.name, ref.category)
      if (result) {
        tools.push(result.tool)
        colors.push(result.category.color)
      }
    }
    return { tools, colors }
  }, [data])

  const resolvedCollections = useMemo(() => {
    if (!data?.collections) return []
    return data.collections.map(col => {
      const tools = []
      const colors = []
      for (const ref of col.tools) {
        const result = findTool(ref.name, ref.category, ref.source)
        if (result) {
          tools.push(result.tool)
          colors.push(result.category.color)
        }
      }
      return { id: col.id, name: col.name, color: col.color, tools, colors }
    })
  }, [data])

  useEffect(() => {
    if (!data || selectedTool) return
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.dataset.categoryId)
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )
    for (const id in sectionRefs.current) {
      const el = sectionRefs.current[id]
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [data, selectedTool])

  const scrollToCategory = id => {
    if (selectedTool) {
      setSelectedTool(null)
      setSelectedCategory(null)
      setTimeout(() => scrollToEl(id), 50)
      return
    }
    scrollToEl(id)
  }

  const scrollToEl = id => {
    if (id === 'newThisWeek') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const el = sectionRefs.current[id]
    if (el) {
      const navHeight = 56
      const top = el.getBoundingClientRect().top + window.scrollY - navHeight
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  const openTool = (tool, category) => {
    setSelectedTool(tool)
    setSelectedCategory(category)
    window.scrollTo({ top: 0 })
  }

  const closeTool = () => {
    setSelectedTool(null)
    setSelectedCategory(null)
  }

  if (!data) {
    return (
      <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ color: '#64748b', fontSize: '1.1rem' }}>Loading...</div>
      </div>
    )
  }

  const newThisWeekCategory = { id: 'newThisWeek', name: 'New This Week', color: '#ff6b6b' }
  const allRoundersCategory = { id: 'allRounders', name: 'All-Rounders', color: '#a78bfa' }
  const favoritesCategory = { id: 'favorites', name: 'Your Favorites', color: '#f43f5e' }

  return (
    <div className="app">
      <Header lastUpdated={data.lastUpdated} />
      <CategoryNav
        categories={data.categories}
        activeCategory={selectedTool ? null : activeCategory}
        onSelect={scrollToCategory}
      />

      {selectedTool ? (
        <ToolDetail
          tool={selectedTool}
          category={selectedCategory}
          onBack={closeTool}
          isFavorite={isFavorite(selectedTool.name)}
          onToggleFavorite={() => toggleFavorite(selectedTool.name, selectedCategory.id)}
        />
      ) : (
        <>
          <HeroSection tools={resolvedNew.hero} onSelectTool={openTool} />

          <div className="app-container">
            {/* New This Week row */}
            <CategorySection
              category={newThisWeekCategory}
              tools={resolvedNew.row}
              customColors={resolvedNew.colors}
              ref={el => { sectionRefs.current['newThisWeek'] = el }}
              onSelectTool={openTool}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />

            {/* All-Rounders row */}
            <CategorySection
              category={allRoundersCategory}
              tools={resolvedAllRounders.tools}
              customColors={resolvedAllRounders.colors}
              ref={el => { sectionRefs.current['allRounders'] = el }}
              onSelectTool={openTool}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />

            {/* Your Favorites row */}
            {resolvedFavorites.tools.length > 0 && (
              <CategorySection
                category={favoritesCategory}
                tools={resolvedFavorites.tools}
                customColors={resolvedFavorites.colors}
                ref={el => { sectionRefs.current['favorites'] = el }}
                onSelectTool={openTool}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
              />
            )}

            {/* AI Generated row */}
            <div className="tool-row" ref={el => { sectionRefs.current['aiGenerated'] = el }} data-category-id="aiGenerated">
              <div className="row-header">
                <div className="row-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L9 9H2l6 4.5L5.5 22 12 17l6.5 5-2.5-8.5L22 9h-7z" />
                  </svg>
                </div>
                <h2 className="row-title">Generated by AI</h2>
                {resolvedAiGenerated.tools.length > 0 && (
                  <a
                    className="ai-save-row-btn"
                    href="/api/export-generated"
                    download="ai-generated-tools.json"
                    title="Save all generated tools to your PC"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Save
                  </a>
                )}
              </div>
              {resolvedAiGenerated.tools.length > 0 ? (
                <CategorySection
                  category={{ id: 'aiGenerated', name: 'Generated by AI', color: '#a78bfa' }}
                  tools={resolvedAiGenerated.tools}
                  customColors={resolvedAiGenerated.colors}
                  onSelectTool={openTool}
                  hideHeader
                  isFavorite={isFavorite}
                  onToggleFavorite={toggleFavorite}
                />
              ) : (
                <p className="ai-generated-empty">
                  No tools generated yet — use the AI assistant to create some!
                </p>
              )}
            </div>

            {/* Collection rows (Rising Stars, Best Free, etc.) */}
            {resolvedCollections.map(col => (
              <CategorySection
                key={col.id}
                category={{ id: col.id, name: col.name, color: col.color }}
                tools={col.tools}
                customColors={col.colors}
                ref={el => { sectionRefs.current[col.id] = el }}
                onSelectTool={openTool}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
              />
            ))}

            {/* Category rows */}
            {data.categories.map(cat => (
              <CategorySection
                key={cat.id}
                category={cat}
                ref={el => { sectionRefs.current[cat.id] = el }}
                onSelectTool={openTool}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </>
      )}

      <AiSearch data={data} onSelectTool={openTool} onDataRefresh={loadData} />
    </div>
  )
}

export default App
