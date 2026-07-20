function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="app-footer__left">
        <span>&copy; {new Date().getFullYear()} Field Service</span>
        <span className="app-footer__separator">·</span>
        <span>Service Operations Platform</span>
      </div>
      <div className="app-footer__right">
        <a href="#privacy" className="app-footer__link">Privacy</a>
        <a href="#support" className="app-footer__link">Support</a>
        <span className="app-footer__version">v1.0.0</span>
      </div>
    </footer>
  )
}

export default AppFooter
