
import { useState, useMemo } from 'react';

interface SearchableItem {
  id: string;
  title: string;
  description?: string;
  [key: string]: any;
}

export const useSearch = <T extends SearchableItem>(items: T[], searchFields: (keyof T)[]) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;

    return items.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        return typeof value === 'string' && 
               value.toLowerCase().includes(searchQuery.toLowerCase());
      })
    );
  }, [items, searchQuery, searchFields]);

  return {
    searchQuery,
    setSearchQuery,
    filteredItems,
    hasResults: filteredItems.length > 0,
    totalResults: filteredItems.length
  };
};
