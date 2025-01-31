import React, { useState, useEffect } from "react";
import "../styles/TopNavigationBar.scss";
import config from "../config/config";
import LoginButton from "./Login";
import LogoutButton from "./Logout";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import { useLocation } from "react-router-dom";
import NotificationBadge from "./NotificationBadge";

const TopNavigationBar = ({
  onSubIdChange,
  subId,
  nickname,
  setSearchResults,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [selectedSubFilter, setSelectedSubFilter] = useState("");
  const [notification, setNotification] = useState(0);
      
  useEffect(() => {
    if (subId)
    {
    axios
      .get(`${config.baseUrl}/api/matches/notificationcount/${subId}`)
      .then((response) => {
         setNotification(response.data[0].count);
      })
      .catch((error) => {
        console.error("Error fetching toys data", error);
      });
    }
  }, [subId]);

  // Options for the "Filter by" dropdown
  const filterOptions = [
    { value: "AgeGroup", label: "Age Group" },
    { value: "Condition", label: "Condition" },
  ];

  // Options for the "Sub-Filter" dropdown based on selected filter
  const subFilterOptions = {
    AgeGroup: [
      { value: "Ages 0-3", label: "0-3 years" },
      { value: "Ages 3-5", label: "3-5 years" },
      { value: "Ages 6-8", label: "6-8 years" },
      { value: "Ages 9-12", label: "9-12 years" },
    ],
    Condition: [
      { value: "New", label: "New" },
      { value: "Used", label: "Used" },
      { value: "Like New", label: "Like New" },
    ],
  };

  const location = useLocation();

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    axios
      .post(`${config.baseUrl}/api/toys/searchQuery`, { searchQuery })
      .then((response) => {
        // Update the search results with the response data
        setSearchResults(response.data);
        console.log("search was successful", response.data);
        setSearchQuery("");
      })
      .catch((error) => {
        console.error("Error submitting form data:", error);
      });
  };

  const handleSubFilterChange = (selectedOption) => {
    setSelectedSubFilter(selectedOption);
  };

  const sendFilterRequest = (filterType, filterValue) => {
    axios
      .post(`${config.baseUrl}/api/toys/filter`, { filterType, filterValue })
      .then((response) => {
        if (response.data.length > 0) {
          console.log("Filter request was successful:", response.data);
        } else {
          console.log("No results found for the selected filter.");
        }
        setSearchResults(response.data);

        // Clear the filter options
        setSelectedFilter(null);
        setSelectedSubFilter(null);
      })
      .catch((error) => {
        console.error("Error submitting filter request:", error);
      });
  };

  const handleFilterChange = (selectedOption) => {
    setSelectedFilter(selectedOption);

    if (selectedFilter && selectedSubFilter) {
      sendFilterRequest(selectedOption.value, selectedSubFilter);
    }
  };

  const navigate = useNavigate();
  const handleCatalogClick = () => {
    // Reset the filters and retrieve all toys when clicking "Catalog"
    setSelectedFilter("");
    setSelectedSubFilter("");
    setSearchResults([]); // Clear the search results
    navigate("/toys");
  };

  // Check if the current location matches one of the allowed paths
  const isSearchFilterVisible =
    location.pathname === "/" || location.pathname === "/toys";

  const isCatalogVisible = location.pathname !== "/";

  return (
    <div className="top-nav-bar">
      <Link to="/toys" className="top-nav-bar__logo">
        <img src="/logo.png" alt="logo" className="logo" />
      </Link>

    {isCatalogVisible && (
      <Link to="/toys" className="nav-link" onClick={handleCatalogClick}>
      Catalog
    </Link>
    )}

      {isSearchFilterVisible && ( // Conditional rendering
        <form onSubmit={handleSearchSubmit} className="search-form">
          <input
            id = 'searchBar-btn'
            type="text"
            placeholder="Search by toy name..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <button type="submit">Search</button>
        </form>
      )}

      {isSearchFilterVisible && ( // Conditional rendering
        <div className="filter-container">
          <Select
            className="filter-dropdown"
            value={selectedFilter}
            onChange={handleFilterChange}
            options={filterOptions}
            placeholder="Filter by"
          />
          {selectedFilter && (
            <Select
              className="sub-filter-dropdown"
              value={selectedSubFilter}
              onChange={(selectedOption) => {
                // Call the function to update selectedSubFilter
                handleSubFilterChange(selectedOption);
                sendFilterRequest(selectedFilter.value, selectedOption.value);
              }}
              options={subFilterOptions[selectedFilter.value]}
              isDisabled={!selectedFilter}
              placeholder={`Select ${selectedFilter.label}`}
            />
          )}
        </div>
      )}
      {/* Display welcome message if the user is logged in */}
      {subId && (
        <Link to="/userProfile" className="nav-link">
          Welcome, {nickname}
        </Link>
      )}

      {location.pathname === "/userProfile" && (
        <Link to="/toys/new" className="nav-link">
          Add Toy
        </Link>
      )}

      {subId && <NotificationBadge notification={notification} />}

      <LoginButton onSubIdChange={onSubIdChange} />
      <LogoutButton />
    </div>
  );
};

export default TopNavigationBar;
