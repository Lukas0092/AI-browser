function Header({ lastUpdated }) {
  const formatDate = dateStr => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <header className="header">
      <span className="header-logo">AI Tracker</span>
      {lastUpdated && (
        <span className="header-date">Updated {formatDate(lastUpdated)}</span>
      )}
    </header>
  )
}

export default Header
