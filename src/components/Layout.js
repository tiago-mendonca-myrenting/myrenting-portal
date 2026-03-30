import Navbar from './Navbar';
import { Toaster } from './ui/sonner';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
};

export default Layout;
