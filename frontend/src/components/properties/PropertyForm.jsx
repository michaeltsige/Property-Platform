import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Home,
  MapPin,
  DollarSign,
  Type,
  FileText,
  Bed,
  Bath,
  Square,
  CheckCircle,
  ArrowLeft,
  Save,
} from "lucide-react";
import { propertyService } from "../../services/propertyService";
import ImageUpload from "./ImageUpload";
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorMessage from "../shared/ErrorMessage";

const PropertyForm = ({ mode = "create" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [images, setImages] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [newAmenity, setNewAmenity] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      price: "",
      category: "apartment",
      bedrooms: "",
      bathrooms: "",
      area: "",
      location: {
        address: "",
        city: "",
        state: "",
        country: "Ethiopia",
      },
    },
  });

  // Fetch property data for edit mode
  const { data: propertyData, isLoading: loadingProperty } = useQuery({
    queryKey: ["property", id],
    queryFn: () => propertyService.getProperty(id),
    enabled: mode === "edit" && !!id,
  });

  // Set form data when property loads (edit mode)
  useEffect(() => {
    if (propertyData?.data && mode === "edit") {
      const property = propertyData.data;

      // Set form values
      Object.keys(property).forEach((key) => {
        if (
          key !== "images" &&
          key !== "amenities" &&
          key !== "_id" &&
          key !== "__v"
        ) {
          setValue(key, property[key]);
        }
      });

      // Set images
      if (property.images) {
        setImages(property.images);
      }

      // Set amenities
      if (property.amenities) {
        setAmenities(property.amenities);
      }
    }
  }, [propertyData, mode, setValue]);

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (formData) => {
      const data = new FormData();

      // Append form fields
      Object.keys(formData).forEach((key) => {
        if (typeof formData[key] === "object" && formData[key] !== null) {
          Object.keys(formData[key]).forEach((subKey) => {
            data.append(`${key}[${subKey}]`, formData[key][subKey]);
          });
        } else {
          data.append(key, formData[key]);
        }
      });

      // Append amenities
      amenities.forEach((amenity, index) => {
        data.append(`amenities[${index}]`, amenity);
      });

      // Append images
      images.forEach((image, index) => {
        if (image.file) {
          data.append(`images[${index}]`, image.file);
        }
        if (image.caption) {
          data.append(`captions[${index}]`, image.caption);
        }
      });

      if (mode === "create") {
        return propertyService.createProperty(data);
      } else {
        return propertyService.updateProperty(id, formData);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["myProperties"]);
      queryClient.invalidateQueries(["properties"]);

      const message =
        mode === "create"
          ? "Property created successfully! You can now publish it."
          : "Property updated successfully!";

      alert(message);

      if (mode === "create") {
        navigate(`/properties/${data.data._id}`);
      } else {
        navigate(`/owner/dashboard`);
      }
    },
    onError: (error) => {
      alert(
        error.response?.data?.error ||
          "Something went wrong. Please try again.",
      );
    },
  });

  const onSubmit = async (formData) => {
    // Validation
    if (images.length === 0 && mode === "create") {
      alert("Please upload at least one image for the property.");
      return;
    }

    if (formData.price <= 0) {
      alert("Please enter a valid price.");
      return;
    }

    await mutation.mutateAsync(formData);
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity("");
    }
  };

  const handleRemoveAmenity = (index) => {
    setAmenities(amenities.filter((_, i) => i !== index));
  };

  const categories = [
    { value: "apartment", label: "Apartment" },
    { value: "house", label: "House" },
    { value: "villa", label: "Villa" },
    { value: "land", label: "Land" },
    { value: "commercial", label: "Commercial" },
  ];

  if (loadingProperty && mode === "edit") {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Form Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {mode === "create" ? "Create New Property" : "Edit Property"}
              </h1>
              <p className="text-gray-600 mt-2">
                {mode === "create"
                  ? "Fill in the details to list your property"
                  : "Update your property information"}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="bg-primary-100 p-3 rounded-full">
                <Home className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Type className="h-5 w-5 mr-2" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., Modern 3-Bedroom Apartment in City Center"
                  {...register("title", { required: "Title is required" })}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  rows="4"
                  className="input-field"
                  placeholder="Describe your property in detail..."
                  {...register("description", {
                    required: "Description is required",
                  })}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type *
                </label>
                <select
                  className="input-field"
                  {...register("category", {
                    required: "Category is required",
                  })}
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (ETB) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    className="input-field pl-10"
                    placeholder="e.g., 2500000"
                    {...register("price", {
                      required: "Price is required",
                      min: { value: 0, message: "Price must be positive" },
                    })}
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.price.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Location Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Location Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Street address"
                  {...register("location.address", {
                    required: "Address is required",
                  })}
                />
                {errors.location?.address && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.location.address.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., Addis Ababa"
                  {...register("location.city", {
                    required: "City is required",
                  })}
                />
                {errors.location?.city && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.location.city.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State/Region
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., Addis Ababa"
                  {...register("location.state")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  className="input-field"
                  defaultValue="Ethiopia"
                  {...register("location.country", {
                    required: "Country is required",
                  })}
                />
              </div>
            </div>
          </div>

          {/* Property Details Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Property Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <div className="relative">
                  <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    className="input-field pl-10"
                    placeholder="e.g., 3"
                    {...register("bedrooms")}
                  />
                </div>
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms
                </label>
                <div className="relative">
                  <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    className="input-field pl-10"
                    placeholder="e.g., 2"
                    {...register("bathrooms")}
                  />
                </div>
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area (m²)
                </label>
                <div className="relative">
                  <Square className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    className="input-field pl-10"
                    placeholder="e.g., 120"
                    {...register("area")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Amenities Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Amenities</h2>

            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="e.g., Swimming Pool, Parking, Security"
                  className="flex-1 input-field"
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleAddAmenity())
                  }
                />
                <button
                  type="button"
                  onClick={handleAddAmenity}
                  className="btn-primary"
                >
                  Add
                </button>
              </div>

              {/* Selected Amenities */}
              {amenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-green-50 text-green-700 px-3 py-2 rounded-lg"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {amenity}
                      <button
                        type="button"
                        onClick={() => handleRemoveAmenity(index)}
                        className="ml-2 text-green-700 hover:text-green-900"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-sm text-gray-500">
                Add amenities that make your property stand out
              </p>
            </div>
          </div>

          {/* Images Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Property Images *
            </h2>

            <ImageUpload
              images={images}
              onChange={setImages}
              maxImages={10}
              maxSizeMB={5}
            />

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-700">
                <strong>Note:</strong> High-quality images increase engagement
                by up to 400%. Include photos of all rooms, exterior, and
                amenities.
              </p>
            </div>
          </div>

          {/* Submit Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Ready to {mode === "create" ? "List" : "Update"}?
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {mode === "create"
                    ? "Your property will be saved as a draft. You can publish it later."
                    : "Your changes will be saved immediately."}
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mutation.isLoading}
                  className="btn-primary inline-flex items-center"
                >
                  {mutation.isLoading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      {mode === "create"
                        ? "Create Property"
                        : "Update Property"}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Form Tips */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Draft Mode</p>
                    <p className="text-sm text-gray-600">
                      Properties start as drafts. You can edit and publish when
                      ready.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900"></p>
                    <p className="text-sm text-gray-600">
                      Property & Housing Ltd.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyForm;
