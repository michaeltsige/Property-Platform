import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  DollarSign,
  Calendar,
  User,
  Star,
  Share2,
  Mail,
  Phone,
  ChevronLeft,
  Home,
  Shield,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoriteContext";
import ImageGallery from "../components/shared/ImageGallery";
import ContactOwnerModal from "../components/shared/ContactOwnerModal";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import ErrorMessage from "../components/shared/ErrorMessage";
import { propertyService } from "../services/propertyService";

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isOwner, isAdmin } = useAuth();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const queryClient = useQueryClient();
  const [showContactModal, setShowContactModal] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  // Fetch property details
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["property", id],
    queryFn: () => propertyService.getProperty(id),
    retry: 1,
  });

  // for publishing property
  const publishMutation = useMutation({
    mutationFn: () => propertyService.publishProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["property", id]);
      alert("Property published successfully!");
    },
    onError: (error) => {
      alert(error.response?.data?.error || "Failed to publish property");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => propertyService.deleteProperty(id),
    onSuccess: () => {
      alert("Property deleted successfully!");
      navigate("/properties");
    },
    onError: (error) => {
      alert(error.response?.data?.error || "Failed to delete property");
    },
  });

  const property = data?.data;
  const isPropertyOwner = user && property && user.id === property.owner?._id;

  const handleFavoriteClick = async () => {
    if (!property) return;

    try {
      if (isFavorite(property._id)) {
        await removeFavorite(property._id);
      } else {
        await addFavorite(property);
      }
    } catch (error) {
      console.error("Failed to update favorite:", error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
      setShowShareOptions(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <ErrorMessage
            message={error?.response?.data?.error || "Property not found"}
            onRetry={() => navigate("/properties")}
            retryText="Back to Properties"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate("/properties")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Properties
        </button>

        {/* Property Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {property.title}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
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

            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-2" />
              <span>
                {property.location?.address}, {property.location?.city},{" "}
                {property.location?.country}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Share Button */}
            <div className="relative">
              <button
                onClick={() => setShowShareOptions(!showShareOptions)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Share2 className="h-5 w-5" />
                <span>Share</span>
              </button>

              {showShareOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <button
                    onClick={handleShare}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-t-lg"
                  >
                    Copy Link
                  </button>
                  {navigator.share && (
                    <button
                      onClick={handleShare}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-b-lg"
                    >
                      Share via...
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Favorite Button */}
            <button
              onClick={handleFavoriteClick}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                isFavorite(property._id)
                  ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                  : "border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Star
                className={`h-5 w-5 ${isFavorite(property._id) ? "fill-yellow-400" : ""}`}
              />
              <span>{isFavorite(property._id) ? "Saved" : "Save"}</span>
            </button>

            {/* Contact Button */}
            <button
              onClick={() => setShowContactModal(true)}
              className="btn-primary"
            >
              <Mail className="h-5 w-5 mr-2" />
              Contact Owner
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image Gallery */}
          <div className="lg:col-span-2">
            <ImageGallery images={property.images || []} />

            {/* Price & Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatPrice(property.price)}
                  </p>
                  {property.category && (
                    <p className="text-gray-600 capitalize">
                      For Sale • {property.category}
                    </p>
                  )}
                </div>

                {isPropertyOwner && property.status === "draft" && (
                  <button
                    onClick={() => publishMutation.mutate()}
                    disabled={publishMutation.isLoading}
                    className="btn-primary"
                  >
                    {publishMutation.isLoading
                      ? "Publishing..."
                      : "Publish Property"}
                  </button>
                )}

                {isPropertyOwner && property.status !== "published" && (
                  <button
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isLoading}
                    className="btn-secondary text-red-600 border-red-600 hover:bg-red-50"
                  >
                    {deleteMutation.isLoading ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.bedrooms && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Bed className="h-6 w-6 mx-auto text-gray-600" />
                    <p className="text-lg font-semibold mt-2">
                      {property.bedrooms}
                    </p>
                    <p className="text-sm text-gray-600">Bedrooms</p>
                  </div>
                )}

                {property.bathrooms && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Bath className="h-6 w-6 mx-auto text-gray-600" />
                    <p className="text-lg font-semibold mt-2">
                      {property.bathrooms}
                    </p>
                    <p className="text-sm text-gray-600">Bathrooms</p>
                  </div>
                )}

                {property.area && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Square className="h-6 w-6 mx-auto text-gray-600" />
                    <p className="text-lg font-semibold mt-2">
                      {property.area}m²
                    </p>
                    <p className="text-sm text-gray-600">Area</p>
                  </div>
                )}

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Home className="h-6 w-6 mx-auto text-gray-600" />
                  <p className="text-lg font-semibold mt-2 capitalize">
                    {property.category || "Property"}
                  </p>
                  <p className="text-sm text-gray-600">Type</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Description
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Amenities
                </h2>
                <div className="flex flex-wrap gap-3">
                  {property.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-green-50 text-green-700 rounded-lg flex items-center"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Owner Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Property Owner
              </h3>
              <div className="flex items-center space-x-4">
                <div className="bg-primary-100 p-3 rounded-full">
                  <User className="h-8 w-8 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {property.owner?.name}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {property.owner?.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowContactModal(true)}
                className="w-full btn-primary mt-6"
              >
                <Mail className="h-5 w-5 mr-2 inline" />
                Contact Owner
              </button>

              {isPropertyOwner && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Owner View:</strong> You can edit this property from
                    your dashboard.
                  </p>
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Property Details
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span
                    className={`font-medium ${
                      property.status === "published"
                        ? "text-green-600"
                        : property.status === "draft"
                          ? "text-yellow-600"
                          : "text-gray-600"
                    }`}
                  >
                    {property.status.charAt(0).toUpperCase() +
                      property.status.slice(1)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Listed</span>
                  <span className="font-medium">
                    {formatDate(property.createdAt)}
                  </span>
                </div>

                {property.publishedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Published</span>
                    <span className="font-medium">
                      {formatDate(property.publishedAt)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Property ID</span>
                  <span className="font-mono text-sm">
                    {property._id.substring(0, 8)}...
                  </span>
                </div>
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-yellow-800">Safety Tips</h4>
                  <ul className="mt-2 space-y-2 text-sm text-yellow-700">
                    <li>• Never wire money without seeing the property</li>
                    <li>• Meet in public places for initial meetings</li>
                    <li>• Verify the owner's identity</li>
                    <li>• Report suspicious listings</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Owner Modal */}
      <ContactOwnerModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        owner={property.owner}
      />
    </div>
  );
};

export default PropertyDetail;
