import { forwardRef, useRef } from 'react'
import CategoryIcon from './CategoryIcon'
import ToolCard from './ToolCard'

const CategorySection = forwardRef(function CategorySection({ category, tools, onSelectTool, customColors, hideHeader, isFavorite, onToggleFavorite }, ref) {
  const trackRef = useRef(null)

  const scroll = (dir) => {
    const track = trackRef.current
    if (!track) return
    const amount = 280
    track.scrollBy({ left: dir * amount, behavior: 'smooth' })
  }

  const items = tools || category.tools
  const singleColor = !customColors

  return (
    <section
      className="tool-row"
      ref={ref}
      data-category-id={category.id}
    >
      {!hideHeader && (
        <div className="row-header">
          <span className="row-icon" style={{ color: category.color }}>
            <CategoryIcon id={category.id} size={24} />
          </span>
          <h2 className="row-title">{category.name}</h2>
        </div>
      )}
      <div className="row-wrapper">
        <button className="row-arrow row-arrow-left" onClick={() => scroll(-1)} aria-label="Scroll left">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="row-track" ref={trackRef}>
          {items.map((tool, i) => {
            const color = singleColor
              ? category.color
              : (customColors && customColors[i]) || category.color
            const cat = (tool._category) || category
            return (
              <ToolCard
                key={tool.name}
                tool={tool}
                color={color}
                onSelect={() => onSelectTool(tool, cat)}
                isFavorite={isFavorite ? isFavorite(tool.name) : false}
                onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(tool.name, cat.id) : undefined}
              />
            )
          })}
        </div>
        <button className="row-arrow row-arrow-right" onClick={() => scroll(1)} aria-label="Scroll right">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>
      </div>
    </section>
  )
})

export default CategorySection
