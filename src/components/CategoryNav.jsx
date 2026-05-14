import CategoryIcon from './CategoryIcon'

function CategoryNav({ categories, activeCategory, onSelect }) {
  const specialPills = [
    { id: 'newThisWeek', name: 'New This Week', color: '#ff6b6b' },
    { id: 'allRounders', name: 'All-Rounders', color: '#a78bfa' },
  ]

  return (
    <nav className="category-nav">
      <div className="category-nav-inner">
        {specialPills.map(pill => (
          <button
            key={pill.id}
            className={`category-pill${activeCategory === pill.id ? ' active' : ''}`}
            style={{ '--cat-color': pill.color }}
            onClick={() => onSelect(pill.id)}
          >
            {pill.name}
          </button>
        ))}
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`category-pill${activeCategory === cat.id ? ' active' : ''}`}
            style={{ '--cat-color': cat.color }}
            onClick={() => onSelect(cat.id)}
          >
            <CategoryIcon id={cat.id} size={16} />
            {cat.name}
          </button>
        ))}
      </div>
    </nav>
  )
}

export default CategoryNav
