interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
}

export function AutocompleteInput({ value, onChange, suggestions }: AutocompleteInputProps) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 border rounded-lg"
        placeholder="Enter your goal..."
        list="suggestions"
      />
      <datalist id="suggestions">
        {suggestions.map((suggestion, index) => (
          <option key={index} value={suggestion} />
        ))}
      </datalist>
    </div>
  );
}
