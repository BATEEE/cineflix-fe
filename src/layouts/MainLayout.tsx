import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-brand-bg text-white font-sans overflow-x-hidden selection:bg-brand-red/30">
      <Navbar />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
