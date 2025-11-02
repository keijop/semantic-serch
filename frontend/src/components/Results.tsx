import type { Movie } from '../../types'

export function Results({ results }: { results: Movie[] }) {
  if (results.length === 0) {
    return
  }
  return (
    <>
      <h2>5 topK results</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Year</th>
            <th>Genre</th>
            <th>Similarity score</th>
          </tr>
        </thead>
        <tbody>
          {results.map(result => {
            return (
              <tr key={result.id}>
                <td>
                  <a href={result.url} target='_blank'>
                    {result.title}
                  </a>
                </td>
                <td>{result.release_year}</td>
                <td>{result.genre}</td>
                <td>{result.score.toFixed(4)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}
