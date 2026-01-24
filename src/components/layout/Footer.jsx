import React from "react";
import { Building } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Building className="h-6 w-6" />
            <span className="text-xl font-bold">PropertyHub</span>
          </div>
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} PropertyHub. All rights reserved.
          </p>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>
            Multi-tenant property listing platform - Full Stack Exam Project
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
