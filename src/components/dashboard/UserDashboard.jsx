import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Star, Home, MapPin, DollarSign, Calendar, Filter } from "lucide-react";
import { favoriteService } from "../../services/propertyService";
import { useFavorites } from "../../context/FavoriteContext";
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorMessage from "../shared/ErrorMessage";

const UserDashboard = () => {
  const { favorites: localFavorites } = useFavorites();

  // Fetch favorites from API (if authenticated)
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["favorites"],
    queryFn: favoriteService.getFavorites,
    enabled: !!localStorage.getItem("token"),
  });

  const favorites = data?.data || localFavorites;
  const isEmpty = !favorites || favorites.length === 0;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
              <p className="text-gray-600 mt-2">
                Properties you've saved for later
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-primary-100 p-3 rounded-full">
                <Star className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Favorites</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {favorites?.length || 0}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recently Added</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {favorites?.slice(0, 3).length || 0}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Browse More</p>
                <Link
                  to="/properties"
                  className="text-primary-600 hover:text-primary-700 font-medium inline-block mt-2"
                >
                  View Properties →
                </Link>
              </div>
              <Home className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <LoadingSpinner />
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <ErrorMessage
              message={
                error.response?.data?.error || "Failed to load favorites"
              }
              onRetry={() => window.location.reload()}
            />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && isEmpty && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-100 p-6 rounded-full inline-flex mb-6">
                <Star className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No favorites yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start exploring properties and save your favorites to view them
                here.
              </p>
              <Link
                to="/properties"
                className="btn-primary inline-flex items-center"
              >
                <Filter className="h-5 w-5 mr-2" />
                Browse Properties
              </Link>
            </div>
          </div>
        )}

        {/* Favorites Grid */}
        {!isLoading && !isError && !isEmpty && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Saved Properties ({favorites.length})
              </h2>
            </div>

            <div className="divide-y divide-gray-200">
              {favorites.map((property, index) => (
                <Link
                  key={property._id || index}
                  to={`/properties/${property._id}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      {/* Property Image */}
                      <div className="md:w-48">
                        {property.images && property.images.length > 0 ? (
                          <img
                            src={property.images[0].url}
                            alt={property.title}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Home className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Property Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {property.title}
                            </h3>
                            <div className="flex items-center mt-1 text-gray-600">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span className="text-sm">
                                {property.location?.city},{" "}
                                {property.location?.country}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-primary-600">
                              {formatPrice(property.price)}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {property.category}
                            </p>
                          </div>
                        </div>

                        {/* Property Stats */}
                        <div className="flex items-center space-x-6 mt-4">
                          {property.bedrooms && (
                            <div className="flex items-center text-gray-600">
                              <span className="font-medium mr-1">
                                {property.bedrooms}
                              </span>
                              <span className="text-sm">beds</span>
                            </div>
                          )}

                          {property.bathrooms && (
                            <div className="flex items-center text-gray-600">
                              <span className="font-medium mr-1">
                                {property.bathrooms}
                              </span>
                              <span className="text-sm">baths</span>
                            </div>
                          )}

                          {property.area && (
                            <div className="flex items-center text-gray-600">
                              <span className="font-medium mr-1">
                                {property.area}
                              </span>
                              <span className="text-sm">m²</span>
                            </div>
                          )}

                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span className="text-sm">
                              {property.favoritedAt
                                ? formatDate(property.favoritedAt)
                                : formatDate(property.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="mt-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              property.status === "published"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {property.status === "published"
                              ? "Published"
                              : "Draft"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* View All Link */}
            <div className="p-6 border-t border-gray-200">
              <Link
                to="/properties"
                className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
              >
                View all properties
                <svg
                  className="ml-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
