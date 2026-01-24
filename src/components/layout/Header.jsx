import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, Building, User, LogOut, Star } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { user, logout, isAdmin, isOwner } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Building className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">PropertyHub</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="flex items-center space-x-1 text-gray-600 hover:text-primary-600"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link
              to="/properties"
              className="text-gray-600 hover:text-primary-600"
            >
              Properties
            </Link>

            {user && (
              <>
                {isOwner && (
                  <Link
                    to="/owner/dashboard"
                    className="text-gray-600 hover:text-primary-600"
                  >
                    My Listings
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="text-gray-600 hover:text-primary-600"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/user/dashboard"
                  className="flex items-center space-x-1 text-gray-600 hover:text-primary-600"
                >
                  <Star className="h-4 w-4" />
                  <span>Favorites</span>
                </Link>
              </>
            )}
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <div className="hidden md:block">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-primary-600"
                >
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
