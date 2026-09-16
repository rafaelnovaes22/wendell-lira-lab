export function SiteHeader() {
  return (
    <header className="site-header">
      <a
        className="brand-lockup"
        href="#top"
        aria-label="WENDELL LIRA LAB, início"
      >
        <span className="brand-mark">WL</span>
        <span>WENDELL LIRA LAB</span>
      </a>
      <nav className="site-nav" aria-label="Navegação principal">
        <a href="#diagnostico">Diagnóstico</a>
        <a href="#trilhas">Trilhas</a>
        <a href="#coach-ai">Coach AI</a>
        <a className="pill-button" href="#diagnostico">
          Entrar na arena
        </a>
      </nav>
    </header>
  );
}
