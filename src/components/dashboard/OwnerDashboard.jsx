import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Home,
  Plus,
  Edit,
  Eye,
  Upload,
  Trash2,
  Filter,
  BarChart3,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { propertyService } from "../../services/propertyService";
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorMessage from "../shared/ErrorMessage";

const OwnerDashboard = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  // Fetch owner's properties
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["myProperties"],
    queryFn: () => propertyService.getMyProperties(),
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: (id) => propertyService.publishProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["myProperties"]);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => propertyService.deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["myProperties"]);
    },
  });

  const properties = data?.data || [];

  // Filter properties by status
  const filteredProperties =
    statusFilter === "all"
      ? properties
      : properties.filter((p) => p.status === statusFilter);

  const stats = {
    total: properties.length,
    draft: properties.filter((p) => p.status === "draft").length,
    published: properties.filter((p) => p.status === "published").length,
    archived: properties.filter((p) => p.status === "archived").length,
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
      month: "short",
      day: "numeric",
    });
  };

  const handlePublish = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to publish this property? Once published, it cannot be edited.",
      )
    ) {
      await publishMutation.mutateAsync(id);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this property? This action cannot be undone.",
      )
    ) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Properties
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your property listings
              </p>
            </div>
            <Link
              to="/properties/create"
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Property
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.total}
                </p>
              </div>
              <Home className="h-8 w-8 text-primary-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {stats.published}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {stats.draft}
                </p>
              </div>
              <Edit className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Archived</p>
                <p className="text-2xl font-bold text-gray-600 mt-1">
                  {stats.archived}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-400" />
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-4 py-2 rounded-lg ${
                    statusFilter === "all"
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All ({stats.total})
                </button>
                <button
                  onClick={() => setStatusFilter("published")}
                  className={`px-4 py-2 rounded-lg ${
                    statusFilter === "published"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Published ({stats.published})
                </button>
                <button
                  onClick={() => setStatusFilter("draft")}
                  className={`px-4 py-2 rounded-lg ${
                    statusFilter === "draft"
                      ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Drafts ({stats.draft})
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Showing {filteredProperties.length} of {properties.length}{" "}
              properties
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
                error.response?.data?.error || "Failed to load properties"
              }
              onRetry={() => window.location.reload()}
            />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && properties.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-100 p-6 rounded-full inline-flex mb-6">
                <Home className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No properties yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start listing your properties to reach potential buyers or
                renters.
              </p>
              <Link
                to="/properties/create"
                className="btn-primary inline-flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create First Property
              </Link>
            </div>
          </div>
        )}

        {/* Properties Table */}
        {!isLoading && !isError && properties.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProperties.map((property) => (
                    <tr key={property._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-16 w-16 flex-shrink-0 mr-4">
                            {property.images && property.images.length > 0 ? (
                              <img
                                src={property.images[0].url}
                                alt={property.title}
                                className="h-16 w-16 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Home className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <Link
                              to={`/properties/${property._id}`}
                              className="text-sm font-medium text-gray-900 hover:text-primary-600"
                            >
                              {property.title}
                            </Link>
                            <p className="text-sm text-gray-500">
                              {property.location?.city}
                            </p>
                            <div className="flex items-center mt-1">
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                {property.bedrooms || 0} beds •{" "}
                                {property.bathrooms || 0} baths
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
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
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(property.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(property.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/properties/${property._id}`}
                            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          {property.status === "draft" && (
                            <>
                              <Link
                                to={`/properties/edit/${property._id}`}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>

                              <button
                                onClick={() => handlePublish(property._id)}
                                disabled={publishMutation.isLoading}
                                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg"
                                title="Publish"
                              >
                                <Upload className="h-4 w-4" />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleDelete(property._id)}
                            disabled={deleteMutation.isLoading}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty Filter State */}
            {filteredProperties.length === 0 && properties.length > 0 && (
              <div className="text-center py-12">
                <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No properties match your filter
                </h3>
                <p className="text-gray-600 mb-4">
                  Try selecting a different status filter
                </p>
                <button
                  onClick={() => setStatusFilter("all")}
                  className="btn-secondary"
                >
                  Show All Properties
                </button>
              </div>
            )}

            {/* Table Footer */}
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {filteredProperties.length} properties
                </div>
                <Link
                  to="/properties/create"
                  className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Property
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Quick Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">Owner Tips</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>Draft properties can be edited before publishing</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>
                Published properties cannot be edited (create a new listing
                instead)
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>
                Add multiple high-quality photos to attract more interest
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>
                Regular users can contact you through the property details page
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
