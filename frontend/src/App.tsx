import { useState } from 'react'
import { Results } from './components/Results'
import { Search } from './components/Search'
import { useGetMovies } from './useGetMovies'

export function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data, isLoading, isError } = useGetMovies(searchTerm)

  if (isError) {
    return <div>Error</div>
  }

  return (
    <main>
      <Search onSubmit={setSearchTerm} isLoading={isLoading} />
      {isLoading ? <div>Loading...</div> : <Results results={data || []} />}
    </main>
  )
}
