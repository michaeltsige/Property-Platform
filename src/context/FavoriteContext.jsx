import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { favoriteService } from "../services/propertyService";
import { useAuth } from "./AuthContext";

const FavoriteContext = createContext();

export const useFavorites = () => useContext(FavoriteContext);

export const FavoriteProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const { isAuthenticated } = useAuth();

  // Load favorites from localStorage on mount, when page load
  useEffect(() => {
    const storedFavorites = localStorage.getItem("favorites");
    if (storedFavorites) {
      const parsed = JSON.parse(storedFavorites);
      setFavorites(parsed);
      setFavoriteIds(new Set(parsed.map((f) => f._id)));
    }
  }, []);

  // Sync favorites across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "favorites") {
        const newFavorites = JSON.parse(e.newValue || "[]");
        setFavorites(newFavorites);
        setFavoriteIds(new Set(newFavorites.map((f) => f._id)));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Save to localStorage when favorites change
  useEffect(() => {
    if (favorites.length > 0) {
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }
  }, [favorites]);

  const addFavorite = useCallback(
    async (property) => {
      if (!isAuthenticated) {
        // Store locally if not authenticated
        const newFavorites = [...favorites, property];
        setFavorites(newFavorites);
        setFavoriteIds((prev) => new Set([...prev, property._id]));

        // Sync across tabs
        localStorage.setItem("favorites", JSON.stringify(newFavorites));
        return { success: true };
      }

      try {
        // Optimistic update, will add more if possible
        const newFavorites = [...favorites, property];
        setFavorites(newFavorites);
        setFavoriteIds((prev) => new Set([...prev, property._id]));

        // API call
        await favoriteService.addFavorite(property._id);
        return { success: true };
      } catch (error) {
        // Rollback on error
        setFavorites(favorites);
        setFavoriteIds(new Set(favorites.map((f) => f._id)));
        throw error;
      }
    },
    [favorites, isAuthenticated],
  );

  const removeFavorite = useCallback(
    async (propertyId) => {
      if (!isAuthenticated) {
        // Remove locally if not authenticated
        const newFavorites = favorites.filter((f) => f._id !== propertyId);
        setFavorites(newFavorites);
        setFavoriteIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(propertyId);
          return newSet;
        });

        // Sync across tabs
        localStorage.setItem("favorites", JSON.stringify(newFavorites));
        return { success: true };
      }

      try {
        // Optimistic update
        const newFavorites = favorites.filter((f) => f._id !== propertyId);
        setFavorites(newFavorites);
        setFavoriteIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(propertyId);
          return newSet;
        });

        // API call
        await favoriteService.removeFavorite(propertyId);
        return { success: true };
      } catch (error) {
        // Rollback on error
        setFavorites(favorites);
        setFavoriteIds(new Set(favorites.map((f) => f._id)));
        throw error;
      }
    },
    [favorites, isAuthenticated],
  );

  const isFavorite = useCallback(
    (propertyId) => {
      return favoriteIds.has(propertyId);
    },
    [favoriteIds],
  );

  const value = {
    favorites,
    favoriteIds,
    addFavorite,
    removeFavorite,
    isFavorite,
    hasFavorites: favorites.length > 0,
  };

  return (
    <FavoriteContext.Provider value={value}>
      {children}
    </FavoriteContext.Provider>
  );
};
