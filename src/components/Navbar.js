import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import {
  Home,
  FileText,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Users,
  FolderOpen,
  FileCheck,
  Mail,
  Settings,
  Bell
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/messages/unread-count');
      setUnreadCount(res.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const clientLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/documents', label: 'Documentos', icon: FileText },
    { to: '/case', label: 'Processo', icon: FolderOpen },
    { to: '/messages', label: 'Mensagens', icon: MessageSquare, badge: unreadCount },
    { to: '/profile', label: 'Perfil', icon: User }
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/clients', label: 'Clientes', icon: Users },
    { to: '/admin/documents', label: 'Documentos', icon: FileCheck },
    { to: '/admin/cases', label: 'Processos', icon: FolderOpen },
    { to: '/admin/messages', label: 'Mensagens', icon: MessageSquare, badge: unreadCount },
    { to: '/admin/templates', label: 'Templates', icon: Mail }
  ];

  const links = isAdmin ? adminLinks : clientLinks;

  return (
    <nav className="glass sticky top-0 z-50 border-b border-slate-200/50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2">
            <img src="/myrenting-logo.png" alt="My Renting" className="h-8" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link key={link.to} to={link.to}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={`relative gap-2 ${isActive ? 'bg-[#224c57] text-white' : 'text-slate-600 hover:text-[#224c57]'}`}
                    data-testid={`nav-${link.label.toLowerCase()}`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                    {link.badge > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#4ad334] text-black text-xs">
                        {link.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-sm text-slate-600">
              <span className="font-medium text-[#224c57]">{user?.name}</span>
              <span className="ml-2 text-xs px-2 py-1 rounded-full bg-slate-100">
                {isAdmin ? 'Admin' : 'Cliente'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-600"
              data-testid="logout-btn"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 animate-fade-in">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#224c57] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                  {link.badge > 0 && (
                    <Badge className="ml-auto bg-[#4ad334] text-black">{link.badge}</Badge>
                  )}
                </Link>
              );
            })}
            <div className="border-t border-slate-200 pt-4 mt-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 px-4 py-3 text-red-600 w-full rounded-lg hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                Terminar Sessão
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
