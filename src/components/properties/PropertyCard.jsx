import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Square, Star, Eye } from "lucide-react";
import { useFavorites } from "../../context/FavoriteContext";
import { useAuth } from "../../context/AuthContext";

const PropertyCard = ({ property }) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const [optimisticFavorite, setOptimisticFavorite] = React.useState(
    isFavorite(property._id),
  );

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const wasFavorite = optimisticFavorite;

    // Optimistic update, 2nd addition
    setOptimisticFavorite(!wasFavorite);

    try {
      if (wasFavorite) {
        await removeFavorite(property._id);
      } else {
        await addFavorite(property);
      }
    } catch (error) {
      // Rollback on error
      setOptimisticFavorite(wasFavorite);
      console.error("Failed to update favorite:", error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link to={`/properties/${property._id}`} className="block group">
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="relative h-48 overflow-hidden">
          {property.images && property.images.length > 0 ? (
            <img
              src={property.images[0].url}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                property.status === "published"
                  ? "bg-green-100 text-green-800"
                  : property.status === "draft"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
              }`}
            >
              {property.status.charAt(0).toUpperCase() +
                property.status.slice(1)}
            </span>
          </div>

          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full shadow-sm transition-colors"
            aria-label={
              optimisticFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Star
              className={`h-5 w-5 ${optimisticFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
            />
          </button>

          {/* Price Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <p className="text-xl font-bold text-white">
              {formatPrice(property.price)}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {property.title}
          </h3>
          <p className="text-gray-600 text-sm mt-1 line-clamp-2 min-h-[40px]">
            {property.description}
          </p>

          {/* Location */}
          <div className="flex items-center mt-3 text-gray-500 text-sm">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="truncate">
              {property.location?.address}, {property.location?.city}
            </span>
          </div>

          {/* Property Details */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              {property.bedrooms && (
                <div className="flex items-center text-gray-600">
                  <Bed className="h-4 w-4 mr-1" />
                  <span className="text-sm">{property.bedrooms}</span>
                </div>
              )}

              {property.bathrooms && (
                <div className="flex items-center text-gray-600">
                  <Bath className="h-4 w-4 mr-1" />
                  <span className="text-sm">{property.bathrooms}</span>
                </div>
              )}

              {property.area && (
                <div className="flex items-center text-gray-600">
                  <Square className="h-4 w-4 mr-1" />
                  <span className="text-sm">{property.area}m²</span>
                </div>
              )}
            </div>

            <div className="flex items-center text-gray-500 text-sm">
              <Eye className="h-4 w-4 mr-1" />
              <span>View Details</span>
            </div>
          </div>

          {/* Category */}
          <div className="mt-3">
            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
              {property.category || "Property"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
