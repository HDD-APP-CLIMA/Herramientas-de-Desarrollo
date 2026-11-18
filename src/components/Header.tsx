import { NavLink } from 'react-router-dom';

function Header() {
  const appTitle = 'Tempus';

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark shadow-sm"
      style={{ backgroundColor: '#20232A' }}
    >
      <div className="container">
        {/* Brand */}
        <NavLink
          className="navbar-brand d-flex align-items-center gap-2 fw-bold fs-4 mb-0"
          to="/"
        >
          <i className="bi bi-cloud-sun" style={{ color: '#61DAFB' }}></i>
          <span style={{ color: '#61DAFB' }}>{appTitle}</span>
        </NavLink>
        <span className="text-light small opacity-75">Clima y alertas en tiempo real</span>
      </div>
    </nav>
  );
}

export default Header;