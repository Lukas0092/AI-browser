import CategoryIcon from './CategoryIcon'

function getToolLogo(website) {
  try {
    const domain = new URL(website).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
  } catch {
    return null
  }
}

function ToolDetail({ tool, category, onBack, isFavorite, onToggleFavorite }) {
  const logoUrl = getToolLogo(tool.website)

  const pricingBadge = () => {
    if (tool.isFree) return <span className="badge badge-free">Free</span>
    if (tool.hasFreeTier) return <span className="badge badge-freemium">Free Tier</span>
    return <span className="badge badge-paid">Paid</span>
  }

  const videoQuery = encodeURIComponent(tool.name + ' AI demo trailer')

  return (
    <div className="detail-page" style={{ '--cat-color': category.color }}>
      <div className="detail-page-inner">
        <button className="back-btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        {/* Banner */}
        <div
          className="detail-banner"
          style={{
            backgroundImage: tool.preview
              ? `url(${tool.preview})`
              : undefined,
          }}
        >
          <div className="detail-banner-overlay" />
          <div className="detail-banner-content">
            {logoUrl && (
              <img
                className="detail-logo"
                src={logoUrl}
                alt=""
                width="56"
                height="56"
              />
            )}
            <div className="detail-banner-info">
              <h1 className="detail-name">{tool.name}</h1>
              <div className="detail-banner-meta">
                <span className="detail-category-tag">
                  <CategoryIcon id={category.id} size={14} />
                  {category.name}
                </span>
                {pricingBadge()}
              </div>
            </div>
            {onToggleFavorite && (
              <button
                className={`detail-fav-btn${isFavorite ? ' active' : ''}`}
                onClick={onToggleFavorite}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Strengths / Weaknesses */}
        {(tool.pros?.length > 0 || tool.cons?.length > 0) && (
          <div className="detail-columns">
            {tool.pros?.length > 0 && (
              <div className="detail-section">
                <h3 className="detail-section-title">Strengths</h3>
                <ul className="detail-list detail-list-pros">
                  {tool.pros.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
            {tool.cons?.length > 0 && (
              <div className="detail-section">
                <h3 className="detail-section-title">Weaknesses</h3>
                <ul className="detail-list detail-list-cons">
                  {tool.cons.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* About */}
        <div className="detail-section">
          <h3 className="detail-section-title">About</h3>
          <p className="detail-section-text">{tool.description}</p>
        </div>

        {/* Demo Video */}
        <a
          className="detail-video-card"
          href={`https://www.youtube.com/results?search_query=${videoQuery}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="detail-video-play">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <span className="detail-video-label">Watch {tool.name} Demo on YouTube</span>
        </a>

        {/* Specialty / Pricing */}
        <div className="detail-columns">
          <div className="detail-section">
            <h3 className="detail-section-title">Specialty</h3>
            <p className="detail-section-text">{tool.specialty}</p>
          </div>
          <div className="detail-section">
            <h3 className="detail-section-title">Pricing</h3>
            <p className="detail-section-text">{tool.pricing}</p>
          </div>
        </div>

        {/* Visit Button */}
        <a
          className="detail-visit-btn"
          href={tool.website}
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit {tool.name}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </div>
  )
}

export default ToolDetail
