import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import {
  LayoutDashboard,
  Users,
  Heart,
  Settings,
  Image,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

const NAV = [
  { to: '/manage/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/manage/rsvps',     label: 'RSVPs',      icon: Users },
  { to: '/manage/donations', label: 'Donations',  icon: Heart },
  { to: '/manage/gallery',   label: 'Gallery',    icon: Image },
  { to: '/manage/settings',  label: 'Settings',   icon: Settings },
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/manage');
  }

  const Sidebar = () => (
    <aside className="flex h-full w-64 flex-col bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-gray-700 px-6 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500">
          <Heart size={16} className="fill-white text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">Wedding Admin</p>
          <p className="mt-0.5 text-xs text-gray-400">Management Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-1 ${
                isActive
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-700 p-4">
        <div className="mb-3 rounded-lg bg-gray-800 px-3 py-2">
          <p className="text-xs font-medium text-white">{admin?.name}</p>
          <p className="truncate text-xs text-gray-400">{admin?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Heart size={16} className="fill-rose-500 text-rose-500" />
            <span className="text-sm font-semibold text-gray-900">Wedding Admin</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
