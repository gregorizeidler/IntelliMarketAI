"use client";

import { useState, useRef, useEffect } from "react";

type Suggestion = {
  placeId: string;
  text: string;
  structured: {
    main: string;
    secondary: string;
  };
};

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string, placeId?: string) => void;
  placeholder?: string;
  className?: string;
}

export default function PlacesAutocomplete({
  value,
  onChange,
  placeholder = "Digite um endereço...",
  className = ""
}: PlacesAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [sessionToken, setSessionToken] = useState(() => generateSessionToken());
  const timeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Gerar session token único
  function generateSessionToken() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  // Fetch autocomplete suggestions
  const fetchSuggestions = async (input: string) => {
    if (!input || input.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.warn("Google Maps API key not configured");
        return;
      }

      const response = await fetch(
        "https://places.googleapis.com/v1/places:autocomplete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
          },
          body: JSON.stringify({
            input,
            sessionToken,
            languageCode: "pt-BR",
            includedRegionCodes: ["BR"],
          }),
        }
      );

      if (!response.ok) throw new Error("Autocomplete failed");

      const data = await response.json();
      const results = data.suggestions || [];

      setSuggestions(
        results.map((s: any) => ({
          placeId: s.placePrediction?.placeId || "",
          text: s.placePrediction?.text?.text || "",
          structured: {
            main: s.placePrediction?.structuredFormat?.mainText?.text || "",
            secondary: s.placePrediction?.structuredFormat?.secondaryText?.text || "",
          },
        }))
      );
      setIsOpen(true);
    } catch (error) {
      console.error("Autocomplete error:", error);
    }
  };

  // Debounce input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  // Select suggestion
  const handleSelect = (suggestion: Suggestion) => {
    onChange(suggestion.text, suggestion.placeId);
    setSuggestions([]);
    setIsOpen(false);
    // Reset session token after selection
    setSessionToken(generateSessionToken());
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        className={`w-full rounded-xl px-4 py-3 border-2 border-purple-200 focus:border-purple-500 focus:outline-none input-focus transition-all bg-white/80 ${className}`}
        autoComplete="off"
      />

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 glass rounded-xl shadow-2xl overflow-hidden border border-purple-200 animate-slideUp">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-900">
                {suggestion.structured.main}
              </div>
              <div className="text-sm text-gray-500">
                {suggestion.structured.secondary}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

