import React, { useState, useCallback } from "react";
import {
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const ImageUpload = ({
  images = [],
  onChange,
  maxImages = 10,
  maxSizeMB = 5,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState([]);

  const validateFile = (file) => {
    const errors = [];

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      errors.push(
        `Invalid file type: ${file.type}. Only JPG, PNG, and WebP are allowed.`,
      );
    }

    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push(
        `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max ${maxSizeMB}MB.`,
      );
    }

    return errors;
  };

  const handleFileSelect = (files) => {
    const newErrors = [];
    const validFiles = [];

    Array.from(files).forEach((file) => {
      const fileErrors = validateFile(file);
      if (fileErrors.length === 0) {
        const reader = new FileReader();
        reader.onload = (e) => {
          validFiles.push({
            file,
            preview: e.target.result,
            name: file.name,
            size: file.size,
          });

          if (validFiles.length === files.length) {
            const allImages = [...images, ...validFiles].slice(0, maxImages);
            onChange(allImages);
          }
        };
        reader.readAsDataURL(file);
      } else {
        newErrors.push(...fileErrors);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setTimeout(() => setErrors([]), 5000);
    }
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [images],
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const updateImageCaption = (index, caption) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], caption };
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragOver
            ? "border-primary-500 bg-primary-50"
            : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="max-w-md mx-auto">
          <div className="bg-gray-100 p-4 rounded-full inline-flex mb-4">
            <Upload className="h-8 w-8 text-gray-600" />
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Upload Property Images
          </h3>

          <p className="text-gray-600 mb-4">
            Drag & drop images here, or click to browse
          </p>

          <input
            type="file"
            id="image-upload"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          <label
            htmlFor="image-upload"
            className="btn-primary inline-flex items-center cursor-pointer"
          >
            <ImageIcon className="h-5 w-5 mr-2" />
            Select Images
          </label>

          <p className="text-sm text-gray-500 mt-4">
            Up to {maxImages} images, {maxSizeMB}MB each. JPG, PNG, WebP
            supported.
          </p>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">Upload Errors</h4>
              <ul className="mt-1 text-sm text-red-700">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Uploaded Images Preview */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">
              Uploaded Images ({images.length}/{maxImages})
            </h4>
            {images.length > 0 && (
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                Ready to upload
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={image.preview || image.url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Image Info */}
                <div className="mt-2 space-y-2">
                  <p className="text-xs text-gray-600 truncate">
                    {image.name || `Image ${index + 1}`}
                  </p>

                  {/* Caption Input */}
                  <input
                    type="text"
                    placeholder="Add caption (optional)"
                    value={image.caption || ""}
                    onChange={(e) => updateImageCaption(index, e.target.value)}
                    className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                  />

                  {image.size && (
                    <p className="text-xs text-gray-500">
                      {(image.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Image Order Tips */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Tip:</strong> The first image will be used as the main
              thumbnail. Drag & drop to reorder images (feature coming soon).
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
