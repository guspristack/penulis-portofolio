import { lazy, StrictMode, Suspense, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource-variable/source-sans-3';
import './reset.css';
import { Editorial } from './pages/Editorial';

const Admin = lazy(() => import('./pages/Admin'));

function NavigationEffects() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = pathname === '/admin' ? 'Studio Nara · Admin' : 'Nara Adinata · Penulis esai dan feature';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <NavigationEffects />
      <Suspense fallback={<p className="resource-state" role="status">Memuat studio…</p>}>
        <Routes>
          <Route path="/" element={<Editorial />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<main className="resource-state"><h1>Halaman tidak ditemukan</h1><Link to="/">Kembali ke portofolio</Link></main>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
);
