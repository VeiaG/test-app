import SearchScreen from '@/components/SearchScreen';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
export default function SearchModal() {
  const params = useLocalSearchParams();
  const query = params.query as string || '';
  const category = params.category as string || null;
  let filters = {};
  if (params.filters) {
    try {
      filters = JSON.parse(params.filters as string);
    } catch (e) {
      console.error('Error parsing filters:', e);
    }
  }
  return (
    <SearchScreen
      initialQuery={query}
      initialCategory={category}
      initialFilters={filters}
      isModal={true}
    />
  );
}