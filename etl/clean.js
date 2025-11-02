import fs from 'fs'
import path from 'path'
import { parse, format } from 'fast-csv'

const readStream = fs.createReadStream(
  path.join(import.meta.dirname, 'data', 'raw_movies.csv')
)
const writeStream = fs.createWriteStream(
  path.join(import.meta.dirname, 'data', 'cleaned_movies.csv')
)

const csvWriter = format({ headers: true })
csvWriter.pipe(writeStream)

// Columns: Release Year,Title,Origin/Ethnicity,Director,Cast,Genre,Wiki Page,Plot

const MIN_PLOT_CHAR_LENGTH = 200 // equals roughly 50-60 tokens to produce quality embeddings
const ORIGIN_FILTER_KEY = 'Origin/Ethnicity'
const ORIGIN_FILTER_VALUE = 'American'

const isAmerican = row => row[ORIGIN_FILTER_KEY] === ORIGIN_FILTER_VALUE
const isValidPlotLenght = row => row.Plot.length > MIN_PLOT_CHAR_LENGTH
const hasRequiredFields = row => {
  const titleRaw = row['Title']?.trim()
  const genreRaw = row['Genre']?.trim()
  const releaseYear = row['Release Year']?.trim()
  const link = row['Wiki Page']?.trim()
  return (
    titleRaw &&
    titleRaw.toLowerCase() !== 'unknown' &&
    genreRaw &&
    genreRaw.toLowerCase() !== 'unknown' &&
    releaseYear &&
    releaseYear.toLowerCase() !== 'unknown' &&
    link &&
    link.toLowerCase() !== 'unknown'
  )
}

const isValidRow = row => {
  return isAmerican(row) && isValidPlotLenght(row) && hasRequiredFields(row)
}

let validRowCount = 0
const uniqueKeys = new Set()

readStream
  .pipe(parse({ headers: true })) // headers: true returns objects instead of arrays
  .on('data', row => {
    if (!isValidRow(row)) return // Exclude invalid rows

    const key = `${row['Title']?.trim().toLowerCase()}|${row['Wiki Page']
      .trim()
      .toLowerCase()}`

    if (uniqueKeys[key]) return // Exclude possible duplicates

    uniqueKeys.add(key)
    csvWriter.write(row)
    validRowCount++
  })
  .on('end', rowCount => {
    console.log('Total parsed row count: ', rowCount)
    console.log('Valid row count: ', validRowCount)
  })
