// src/pages/HomePage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Home, Search, Heart, Building, Shield } from "lucide-react";

const HomePage = () => {
  const { user, isRegularUser, isOwner, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <Building className="h-16 w-16 text-primary-600" />
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to PropertyHub
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            Find your dream property or list your space with a premier property
            platform
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/properties" className="btn-primary text-lg px-8 py-3">
              <Search className="h-5 w-5 inline mr-2" />
              Browse Properties
            </Link>

            {!user && (
              <Link to="/register" className="btn-secondary text-lg px-8 py-3">
                List Your Property
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How It Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="bg-blue-100 p-4 rounded-full inline-flex mb-4">
              <Search className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Browse Properties
            </h3>
            <p className="text-gray-600">
              Explore thousands of properties with detailed filters and photos
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="bg-green-100 p-4 rounded-full inline-flex mb-4">
              <Heart className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Save Favorites
            </h3>
            <p className="text-gray-600">
              Save properties you love and get notifications
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="bg-purple-100 p-4 rounded-full inline-flex mb-4">
              <Building className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              List Properties
            </h3>
            <p className="text-gray-600">
              Owners can easily list and manage their properties
            </p>
          </div>
        </div>
      </div>

      {/* Role-Based Quick Actions */}
      {user && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Quick Actions
          </h2>

          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isRegularUser && (
                <>
                  <Link
                    to="/properties"
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <h3 className="font-semibold text-gray-900">
                      Browse Properties
                    </h3>
                    <p className="text-sm text-gray-600">Find your next home</p>
                  </Link>
                  <Link
                    to="/user/dashboard"
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <h3 className="font-semibold text-gray-900">
                      View Favorites
                    </h3>
                    <p className="text-sm text-gray-600">
                      See saved properties
                    </p>
                  </Link>
                </>
              )}

              {isOwner && (
                <>
                  <Link
                    to="/owner/dashboard"
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <h3 className="font-semibold text-gray-900">My Listings</h3>
                    <p className="text-sm text-gray-600">
                      Manage your properties
                    </p>
                  </Link>
                  <Link
                    to="/properties/create"
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <h3 className="font-semibold text-gray-900">
                      Add New Property
                    </h3>
                    <p className="text-sm text-gray-600">List a new property</p>
                  </Link>
                </>
              )}

              {isAdmin && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <h3 className="font-semibold text-gray-900">
                      Admin Dashboard
                    </h3>
                    <p className="text-sm text-gray-600">System management</p>
                  </Link>
                  <Link
                    to="/properties"
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <h3 className="font-semibold text-gray-900">
                      View All Properties
                    </h3>
                    <p className="text-sm text-gray-600">Browse all listings</p>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
