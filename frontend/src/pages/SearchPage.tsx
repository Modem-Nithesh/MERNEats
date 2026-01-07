import { useSearchRestaurants } from "@/api/RestaurantApi";
import SearchBar, { type SearchForm } from "@/components/SearchBar";
import CuisineFilter from "@/components/CuisineFilter";
import SearchResultCard from "@/components/SearchResultCard";
import SortOptionDropdown from "@/components/SortOptionDropdown";
import { type SearchState } from "@/types";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";


const SearchPage = () => {
  const { city } = useParams();
  const [searchState, setSearchState] = useState<SearchState>({
    searchQuery: "",
    page: 1,
    selectedCuisines: [],
    sortOption: "bestMatch",
  });

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const { results, isLoading } = useSearchRestaurants(searchState, city);

  const setSearchQuery = (searchFormData: SearchForm) => {
    setSearchState((prevState) => ({
      ...prevState,
      searchQuery: searchFormData.searchQuery,
      page: 1,
    }));
  };

  const setSortOption = (sortOption: string) => {
    setSearchState((prevState) => ({
      ...prevState,
      sortOption,
      page: 1,
    }));
  };
  const resetSearch = () => {
    setSearchState((prevState) => ({
      ...prevState,
      searchQuery: "",
      page: 1,
    }));
  };

  const setPage = (page: number) => {
    setSearchState((prevState) => ({
      ...prevState,
      page,
    }));
  };

  const setSelectedCuisines = (selectedCuisines: string[]) => {
    setSearchState((prevState) => ({
      ...prevState,
      selectedCuisines,
      page: 1,
    }));
  };

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (!results?.data || !city) {
    return <span>No results found</span>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-5">
      <div id="cuisines-list">
        <CuisineFilter
          selectedCuisines={searchState.selectedCuisines}
          onChange={setSelectedCuisines}
          isExpanded={isExpanded}
          onExpandedClick={() => setIsExpanded((prev) => !prev)}
        />
      </div>
      <div id="main-content" className="flex flex-col gap-5">
        <SearchBar
          searchQuery={searchState.searchQuery}
          onSubmit={setSearchQuery}
          placeHolder="Search by Cuisine or Restaurant Name"
          onReset={resetSearch}
        />
        <div className="flex justify-between flex-col gap-3 lg:flex-row">
          <span className="text-xl font-bold">
            {results.pagination.total} Restaurants found in {city}
            <a
              href="/"
              className="ml-1 text-sm font-semibold underline cursor-pointer text-blue-500"
            >
              Change Location
            </a>
          </span>
          {/* Added Sort Option Dropdown */}
          <SortOptionDropdown
            sortOption={searchState.sortOption}
            onChange={(value) => setSortOption(value)}
          />
        </div>
        {results?.data.map((restaurant) => (
          <SearchResultCard key={restaurant._id} restaurant={restaurant} />
        ))}

        {/* Pagination Controls */}
        <div className="flex justify-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage(searchState.page - 1)}
            disabled={searchState.page <= 1}
          >
            Previous
          </Button>
          <span className="flex items-center font-bold">
            Page {results?.pagination.page} of {results?.pagination.pages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(searchState.page + 1)}
            disabled={searchState.page >= (results?.pagination.pages || 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
