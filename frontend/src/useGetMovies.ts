import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { Movie } from '../types'

export function useGetMovies(term: string): UseQueryResult<Movie[], Error> {
  return useQuery({
    queryKey: [term],
    queryFn: async () => {
      const response = await fetch('/api/semanticMovieSearch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchTerm: term }),
      })
      const data = await response.json()
      return data.results
    },
    enabled: !!term,
  })
}
