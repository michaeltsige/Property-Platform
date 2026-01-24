import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Home,
  BarChart3,
  Shield,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import { adminService, propertyService } from "../../services/propertyService";
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorMessage from "../shared/ErrorMessage";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();

  // Fetch system metrics
  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ["adminMetrics"],
    queryFn: adminService.getMetrics,
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: propertiesData, isLoading: propertiesLoading } = useQuery({
    queryKey: ["adminProperties"],
    queryFn: adminService.getAllProperties,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: adminService.getUsers,
  });

  const togglePropertyMutation = useMutation({
    mutationFn: ({ id, action }) => adminService.toggleProperty(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminProperties"]);
      queryClient.invalidateQueries(["adminMetrics"]);
    },
  });

  const metrics = metricsData?.data || {};
  const properties = propertiesData?.data || [];
  const users = usersData?.data || [];

  const handleToggleProperty = async (id, currentStatus) => {
    const action = currentStatus === "published" ? "disable" : "enable";
    const confirmMessage =
      action === "disable"
        ? "Are you sure you want to disable this property? It will be archived."
        : "Are you sure you want to enable this property? It will be published.";

    if (window.confirm(confirmMessage)) {
      await togglePropertyMutation.mutateAsync({ id, action });
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isLoading = metricsLoading || propertiesLoading || usersLoading;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-2">
                  System overview and management
                </p>
              </div>
            </div>
            <button
              onClick={() => queryClient.invalidateQueries()}
              className="btn-secondary inline-flex items-center"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "overview"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <BarChart3 className="h-5 w-5 inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab("properties")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "properties"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Home className="h-5 w-5 inline mr-2" />
                Properties ({properties.length})
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "users"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Users className="h-5 w-5 inline mr-2" />
                Users ({users.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <LoadingSpinner />
          </div>
        )}

        {/* Overview Tab */}
        {!isLoading && activeTab === "overview" && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatNumber(metrics.users?.total || 0)}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <div className="mt-4 space-y-2">
                  {metrics.users?.byRole &&
                    Object.entries(metrics.users.byRole).map(
                      ([role, count]) => (
                        <div
                          key={role}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-600 capitalize">
                            {role}s
                          </span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ),
                    )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Properties</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatNumber(metrics.properties?.total || 0)}
                    </p>
                  </div>
                  <Home className="h-8 w-8 text-green-500" />
                </div>
                <div className="mt-4 space-y-2">
                  {metrics.properties?.byStatus &&
                    Object.entries(metrics.properties.byStatus).map(
                      ([status, count]) => (
                        <div
                          key={status}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-600 capitalize">
                            {status}
                          </span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ),
                    )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">System Health</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      Operational
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <div className="mt-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-full"></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    All systems normal
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Views</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatNumber(metrics.totalViews || 0)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
                <div className="mt-4">
                  <div className="text-sm text-gray-600">Last 30 days</div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-purple-500 w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Properties */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Properties
                  </h2>
                  <span className="text-sm text-gray-600">
                    Last {Math.min(5, metrics.recentProperties?.length || 0)}{" "}
                    added
                  </span>
                </div>
              </div>

              {metrics.recentProperties &&
              metrics.recentProperties.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {metrics.recentProperties.slice(0, 5).map((property) => (
                    <div key={property._id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 flex-shrink-0">
                            {property.images && property.images.length > 0 ? (
                              <img
                                src={property.images[0].url}
                                alt={property.title}
                                className="h-12 w-12 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Home className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {property.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {property.owner?.name} •{" "}
                              {formatDate(property.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              property.status === "published"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {property.status}
                          </span>
                          <button
                            onClick={() =>
                              handleToggleProperty(
                                property._id,
                                property.status,
                              )
                            }
                            className={`px-3 py-1 rounded-lg text-sm ${
                              property.status === "published"
                                ? "bg-red-50 text-red-700 hover:bg-red-100"
                                : "bg-green-50 text-green-700 hover:bg-green-100"
                            }`}
                          >
                            {property.status === "published"
                              ? "Disable"
                              : "Enable"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No recent properties
                  </h3>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab("properties")}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Home className="h-5 w-5 mr-3 text-gray-400" />
                        <span>Manage Properties</span>
                      </div>
                      <span className="text-gray-400">→</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("users")}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 mr-3 text-gray-400" />
                        <span>Manage Users</span>
                      </div>
                      <span className="text-gray-400">→</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  System Info
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Environment</span>
                    <span className="font-medium">{import.meta.env.MODE}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-medium">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">API Status</span>
                    <span className="font-medium text-green-600">Online</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Database</span>
                    <span className="font-medium">Connected</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Properties Tab */}
        {!isLoading && activeTab === "properties" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  All Properties
                </h2>
                <span className="text-sm text-gray-600">
                  {properties.length} total
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
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
                  {properties.map((property) => (
                    <tr key={property._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 mr-3">
                            {property.images && property.images.length > 0 ? (
                              <img
                                src={property.images[0].url}
                                alt={property.title}
                                className="h-10 w-10 object-cover rounded"
                              />
                            ) : (
                              <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                                <Home className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {property.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {property.location?.city}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {property.owner?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {property.owner?.email}
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
                          {property.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(property.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <a
                            href={`/properties/${property._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </a>

                          <button
                            onClick={() =>
                              handleToggleProperty(
                                property._id,
                                property.status,
                              )
                            }
                            disabled={togglePropertyMutation.isLoading}
                            className={`p-2 rounded ${
                              property.status === "published"
                                ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                                : "text-green-600 hover:text-green-700 hover:bg-green-50"
                            }`}
                            title={
                              property.status === "published"
                                ? "Disable"
                                : "Enable"
                            }
                          >
                            {property.status === "published" ? (
                              <XCircle className="h-4 w-4" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {properties.length === 0 && (
              <div className="p-12 text-center">
                <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No properties found
                </h3>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {!isLoading && activeTab === "users" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  All Users
                </h2>
                <span className="text-sm text-gray-600">
                  {users.length} total
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 mr-3 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="font-medium text-primary-600">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user._id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : user.role === "owner"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No users found
                </h3>
              </div>
            )}
          </div>
        )}

        {/* Admin Notes */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Admin Notes
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-gray-400" />
              <span>
                Disabled properties are archived and hidden from public view
              </span>
            </li>
            <li className="flex items-start">
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-gray-400" />
              <span>
                Only disable properties that violate platform policies
              </span>
            </li>
            <li className="flex items-start">
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-gray-400" />
              <span>
                User accounts are automatically activated upon registration
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
