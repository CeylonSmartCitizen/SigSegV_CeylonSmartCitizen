import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import '../../styles/SearchBar.css';

const SearchBar = ({ onSearch, suggestions = [], placeholder = "Search services..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    // Filter suggestions based on search term
    if (searchTerm.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, suggestions]);

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setActiveSuggestionIndex(-1);
    onSearch(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => 
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestionIndex >= 0) {
        selectSuggestion(filteredSuggestions[activeSuggestionIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
  };

  const selectSuggestion = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    onSearch(suggestion);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    onSearch('');
  };

  return (
    <div className="search-bar-container" ref={searchRef}>
      <div className="search-input-wrapper">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm.length > 0 && setShowSuggestions(filteredSuggestions.length > 0)}
        />
        {searchTerm && (
          <button className="clear-search-btn" onClick={clearSearch}>
            <X size={16} />
          </button>
        )}
      </div>

      {showSuggestions && (
        <div className="search-suggestions" ref={suggestionsRef}>
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`suggestion-item ${index === activeSuggestionIndex ? 'active' : ''}`}
              onClick={() => selectSuggestion(suggestion)}
              onMouseEnter={() => setActiveSuggestionIndex(index)}
            >
              <Search size={16} />
              <span>{suggestion}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
