import React, { useState, useRef, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Badge } from './Badge';

interface TagInputProps {
  tags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
  error?: string;
}

export function TagInput({
  tags,
  selectedTags,
  onChange,
  placeholder = 'Rechercher...',
  maxTags = 10,
  className = '',
  error
}: TagInputProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtrer les tags en fonction du terme de recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTags(tags.filter(tag => !selectedTags.includes(tag)));
    } else {
      const filtered = tags.filter(
        tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !selectedTags.includes(tag)
      );
      setFilteredTags(filtered);
    }
  }, [searchTerm, tags, selectedTags]);

  // Gérer les clics en dehors du dropdown pour le fermer
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Ajouter un tag
  const addTag = (tag: string) => {
    if (selectedTags.length < maxTags && !selectedTags.includes(tag)) {
      onChange([...selectedTags, tag]);
      setSearchTerm('');
    }
  };

  // Supprimer un tag
  const removeTag = (tagToRemove: string) => {
    onChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  // Gérer la saisie dans l'input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isDropdownOpen) {
      setIsDropdownOpen(true);
    }
  };

  // Gérer le focus sur l'input
  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 min-h-[42px]">
        {selectedTags.map(tag => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1 py-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <div className="relative flex-1 min-w-[120px]">
          <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={selectedTags.length === 0 ? placeholder : ''}
            className="w-full py-1 pl-8 pr-2 bg-transparent border-none focus:ring-0 focus:outline-none text-sm"
          />
        </div>
      </div>
      
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      
      {isDropdownOpen && filteredTags.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg"
        >
          <ul className="py-1">
            {filteredTags.map(tag => (
              <li 
                key={tag}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                onClick={() => {
                  addTag(tag);
                  setIsDropdownOpen(false);
                }}
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
