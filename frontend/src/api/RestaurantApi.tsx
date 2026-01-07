import { type SearchState } from "@/types";
import { type Restaurant, type RestaurantSearchResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useGetRestaurant = (restaurantId?: string) => {
  const getRestaurantRequest = async (): Promise<Restaurant> => {
    const response = await fetch(
      `${API_BASE_URL}/api/restaurant/${restaurantId}`
    );

    if (!response.ok) {
      throw new Error("Failed to get restaurant");
    }

    return response.json();
  };

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ["fetchRestaurant", restaurantId],
    queryFn: getRestaurantRequest,
    enabled: !!restaurantId,
  });

  return { restaurant, isLoading };
};

// Add 'page' to the input arguments
export const useSearchRestaurants = (
  searchState: SearchState,
  city?: string
) => {
  const createSearchRequest = async (): Promise<RestaurantSearchResponse> => {
    const params = new URLSearchParams();
    params.set("searchQuery", searchState.searchQuery);
    params.set("page", searchState.page.toString()); // <--- Send Page
    params.set("selectedCuisines", searchState.selectedCuisines.join(","));
    params.set("sortOption", searchState.sortOption);

    const response = await fetch(
      `${API_BASE_URL}/api/restaurant/search/${city}?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error("Failed to get restaurants");
    }

    return response.json();
  };

  const { data: results, isLoading } = useQuery({
    queryKey: ["searchRestaurants", searchState], // 1. Key
    queryFn: createSearchRequest, // 2. Function
    enabled: !!city, // 3. Options
  });

  return {
    results,
    isLoading,
  };
};
