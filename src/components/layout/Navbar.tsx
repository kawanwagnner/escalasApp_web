import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Calendar,
  Users,
  UserCircle,
  LogOut,
  Bell,
  Home,
  Clock,
  Megaphone,
  CalendarDays,
  CalendarRange,
  Menu,
  X,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Itens principais (visíveis no desktop)
  const mainNavItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/ministerios", label: "Ministérios", icon: Calendar },
    { path: "/agenda", label: "Agenda", icon: CalendarRange },
  ];

  // Todos os itens (para o menu hambúrguer)
  const allNavItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/ministerios", label: "Ministérios", icon: Calendar },
    { path: "/agenda", label: "Agenda", icon: CalendarRange },
    { path: "/minhas-escalas", label: "Minhas Escalas", icon: Clock },
    { path: "/convites", label: "Convites", icon: Bell },
    { path: "/comunicados", label: "Comunicados", icon: Megaphone },
    { path: "/eventos", label: "Eventos", icon: CalendarDays },
    { path: "/membros", label: "Membros", icon: Users },
  ];

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-white shadow-lg relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="shrink-0 flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Escalas App
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.path)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right side - User info + Hamburger */}
          <div className="flex items-center gap-2">
            {/* User info (desktop only) */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/perfil"
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <UserCircle className="h-6 w-6" />
                <span className="text-sm font-medium">{user?.full_name}</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm">Sair</span>
              </button>
            </div>

            {/* Hamburger button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors lg:hidden"
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Desktop hamburger for extra items */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="hidden lg:flex p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Menu Overlay - fecha ao clicar fora */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:bg-black/20"
          onClick={closeMenu}
        />
      )}

      {/* Slide-out Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        } lg:absolute lg:top-full lg:right-4 lg:h-auto lg:w-64 lg:rounded-lg lg:shadow-lg ${
          isMenuOpen ? "lg:block lg:pointer-events-auto" : "lg:hidden"
        }`}
      >
        {/* Menu Header (mobile only) */}
        <div className="flex items-center justify-between p-4 border-b lg:hidden">
          <span className="text-lg font-semibold text-gray-900">Menu</span>
          <button
            onClick={closeMenu}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User info (mobile only) */}
        <div className="p-4 border-b bg-gray-50 lg:hidden">
          <div className="flex items-center gap-3">
            <UserCircle className="h-10 w-10 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">{user?.full_name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="py-2">
          {allNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={`flex items-center px-4 py-3 text-base font-medium transition-colors ${
                  isActive(item.path)
                    ? "text-blue-600 bg-blue-50 border-r-4 border-blue-600"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="border-t my-2" />

        {/* Profile & Logout */}
        <div className="py-2">
          <Link
            to="/perfil"
            onClick={closeMenu}
            className={`flex items-center px-4 py-3 text-base font-medium transition-colors ${
              isActive("/perfil")
                ? "text-blue-600 bg-blue-50 border-r-4 border-blue-600"
                : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            }`}
          >
            <UserCircle className="h-5 w-5 mr-3" />
            Meu Perfil
          </Link>
          <button
            onClick={() => {
              closeMenu();
              signOut();
            }}
            className="w-full flex items-center px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
};
