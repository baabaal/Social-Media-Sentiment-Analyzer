import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Results from './pages/Results.jsx';
import History from './pages/History.jsx';

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <Link to="/" className="logo">
          <span className="logo-icon">◆</span>
          Sentiment Analyzer
        </Link>
        <nav className="nav">
          <Link to="/">Beranda</Link>
          <Link to="/history">Riwayat</Link>
        </nav>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results/:id" element={<Results />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Sentiment Analyzer — Built with MERN Stack</p>
      </footer>
    </div>
  );
}
