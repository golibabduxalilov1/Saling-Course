import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function PublicLayout() {
  return (
    <div className="min-h-dvh bg-canvas flex flex-col">
      <Header />
      <main id="main" className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
