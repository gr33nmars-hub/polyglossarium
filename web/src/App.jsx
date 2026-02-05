import { useEffect } from 'react';
import Lenis from 'lenis';
import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Header from './components/Header';
import Hero from './components/Hero';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy Load heavy components
const GridSystem = lazy(() => import('./components/GridSystem'));
const Methodology = lazy(() => import('./components/Methodology'));
const AuthBanner = lazy(() => import('./components/AuthBanner'));
const AboutPage = lazy(() => import('./components/AboutPage'));
const ProtocolChat = lazy(() => import('./components/ProtocolChat'));
const TreeMap = lazy(() => import('./components/TreeMap'));

function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <Layout>
        <Suspense fallback={
          <div className="h-[50vh] flex items-center justify-center font-mono animate-pulse">
            ИНИЦИАЛИЗАЦИЯ МОДУЛЕЙ...
          </div>
        }>
          <GridSystem />
          <Methodology />
          <AuthBanner />
        </Suspense>
      </Layout>
    </>
  );
}

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={
            <Suspense fallback={
              <div className="h-screen flex items-center justify-center font-mono animate-pulse">
                ЗАГРУЗКА...
              </div>
            }>
              <AboutPage />
            </Suspense>
          } />
          <Route path="/protocol" element={
            <Suspense fallback={
              <div className="h-screen flex items-center justify-center font-mono animate-pulse">
                ЗАГРУЗКА...
              </div>
            }>
              <ProtocolChat />
            </Suspense>
          } />
          <Route path="/map" element={
            <Suspense fallback={
              <div className="h-screen flex items-center justify-center font-mono animate-pulse">
                ЗАГРУЗКА...
              </div>
            }>
              <TreeMap />
            </Suspense>
          } />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
