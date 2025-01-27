import { useState } from 'react';

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
}

export const AutocompleteInput = ({ 
  value, 
  onChange,
  suggestions 
}: AutocompleteInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
        className="w-full p-3 border rounded-lg"
      />
      
      {showSuggestions && (
        <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
          {suggestions
            .filter((suggestion) =>
              suggestion.toLowerCase().includes(value.toLowerCase())
            )
            .map((suggestion, index) => (
              <div
                key={index}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent form submission
                  handleSuggestionClick(suggestion);
                }}
                className="p-3 hover:bg-gray-100 cursor-pointer"
              >
                {suggestion}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};