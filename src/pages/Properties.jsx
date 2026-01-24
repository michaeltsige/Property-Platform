import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import PropertyCard from "../components/properties/PropertyCard";
import PropertyFilters from "../components/properties/PropertyFilters";
import Pagination from "../components/shared/Pagination";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import ErrorMessage from "../components/shared/ErrorMessage";
import { propertyService } from "../services/propertyService";

const Properties = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const limit = 12;

  // Build query params
  const queryParams = {
    page,
    limit,
    ...filters,
    status: "published", // Only show published properties
  };

  Object.keys(queryParams).forEach((key) => {
    if (queryParams[key] === "" || queryParams[key] === undefined) {
      delete queryParams[key];
    }
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["properties", queryParams],
    queryFn: () => propertyService.getProperties(queryParams),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Prefetch next page
  useEffect(() => {
    if (data?.totalPages && page < data.totalPages) {
      const nextPage = page + 1;
      const nextParams = { ...queryParams, page: nextPage };

      // queryClient.prefetchQuery({
      //   queryKey: ['properties', nextParams],
      //   queryFn: () => propertyService.getProperties(nextParams),
      // });
    }
  }, [data, page, queryParams]);

  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <ErrorMessage
            message={error.response?.data?.error || "Failed to load properties"}
            onRetry={refetch}
          />
        </div>
      </div>
    );
  }

  const properties = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const totalProperties = data?.total || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Browse Properties
          </h1>
          <p className="text-gray-600 mt-2">
            {totalProperties} properties available
            {filters.location && ` in ${filters.location}`}
          </p>
        </div>

        {/* Filters */}
        <PropertyFilters
          onFilterChange={handleFilterChange}
          initialFilters={filters}
        />

        {properties.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-5xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No properties found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or check back later for new listings.
              </p>
              <button
                onClick={() => {
                  setFilters({});
                  setPage(1);
                }}
                className="btn-primary"
              >
                Clear all filters
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}

        {/* Loading indicator for next page */}
        {isLoading && data && (
          <div className="mt-8">
            <LoadingSpinner />
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;
