import React from 'react'

export function Search({
  onSubmit,
  isLoading,
}: {
  onSubmit: (term: string) => void
  isLoading: boolean
}) {
  const [inputValue, setInputValue] = React.useState<string>('')

  return (
    <div>
      <h1>CineSearch</h1>
      <form
        onSubmit={e => {
          e.preventDefault()
          onSubmit(inputValue)
        }}
      >
        <label htmlFor='search'>
          What kind of movie would you like to see today?
        </label>
        <textarea
          id='search'
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          rows={3}
        />
        <button disabled={isLoading} type='submit'>
          Search
        </button>
      </form>
    </div>
  )
}
