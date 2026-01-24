import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/shared/LoadingSpinner";

const Home = () => {
  const navigate = useNavigate();
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading) {
      // Redirect to properties page (public listing), where no registered account is needed
      navigate("/properties");
    }
  }, [loading, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return null;
};

export default Home;
