import { useState, useEffect, useCallback } from 'react'
import CategoryIcon from './CategoryIcon'

function getToolLogo(website) {
  try {
    const domain = new URL(website).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
  } catch {
    return null
  }
}

function HeroSection({ tools, onSelectTool }) {
  const [activeIndex, setActiveIndex] = useState(0)

  const goTo = useCallback((i) => {
    setActiveIndex(i)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % tools.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [tools.length])

  if (!tools || tools.length === 0) return null

  const item = tools[activeIndex]
  const logoUrl = getToolLogo(item.tool.website)

  const pricingBadge = () => {
    if (item.tool.isFree) return <span className="badge badge-free">Free</span>
    if (item.tool.hasFreeTier) return <span className="badge badge-freemium">Free Tier</span>
    return <span className="badge badge-paid">Paid</span>
  }

  return (
    <section className="hero-section" style={{ '--hero-color': item.category.color }}>
      <div className="hero-backdrop" />
      <div className="hero-content">
        <span className="hero-label">New This Week</span>
        <div className="hero-logo-row">
          {logoUrl && (
            <img
              className="hero-logo"
              src={logoUrl}
              alt=""
              width="128"
              height="128"
            />
          )}
        </div>
        <h2 className="hero-title">{item.tool.name}</h2>
        <p className="hero-description">{item.heroDescription}</p>
        <div className="hero-meta">
          <span className="hero-category-tag" style={{ color: item.category.color }}>
            <CategoryIcon id={item.category.id} size={16} />
            {item.category.name}
          </span>
          {pricingBadge()}
        </div>
        <button
          className="hero-cta"
          onClick={() => onSelectTool(item.tool, item.category)}
        >
          View Details
        </button>
      </div>
      <div className="hero-dots">
        {tools.map((_, i) => (
          <button
            key={i}
            className={`hero-dot${i === activeIndex ? ' active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Show featured tool ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

export default HeroSection
