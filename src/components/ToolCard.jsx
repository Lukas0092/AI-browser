function getToolLogo(website) {
  try {
    const domain = new URL(website).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
  } catch {
    return null
  }
}

function ToolCard({ tool, color, onSelect, isFavorite, onToggleFavorite }) {
  const pricingBadge = () => {
    if (tool.isFree) return <span className="badge badge-free">Free</span>
    if (tool.hasFreeTier) return <span className="badge badge-freemium">Free Tier</span>
    return <span className="badge badge-paid">Paid</span>
  }

  const logoUrl = getToolLogo(tool.website)

  return (
    <div
      className="tool-card"
      style={{ '--cat-color': color }}
      onClick={onSelect}
    >
      <div className="card-poster">
        <div className="card-rank">#{tool.rank}</div>
        <div className="card-pricing-corner">{pricingBadge()}</div>
        <div className="card-logo-wrap">
          {logoUrl && (
            <img
              className="card-logo"
              src={logoUrl}
              alt=""
              width="56"
              height="56"
              loading="lazy"
            />
          )}
        </div>
        {tool.preview && (
          <img
            className="card-preview"
            src={tool.preview}
            alt=""
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        )}
        {onToggleFavorite && (
          <button
            className={`card-fav-btn${isFavorite ? ' active' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleFavorite() }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}
      </div>
      <div className="card-body">
        <div className="card-name">{tool.name}</div>
        <div className="card-tagline">{tool.tagline}</div>
      </div>
    </div>
  )
}

export default ToolCard
