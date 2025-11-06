# Movies Search

A semantic movie search application powered by vector embeddings and Azure Cosmos DB. This project enables natural language search across movie titles, genres, and plots.

## Goal

Learn core data engineering and machine learning concepts through a practical semantic search application. Showcase ETL pipelines, vector embeddings, similarity search, and full-stack development with modern cloud technologies.

## 🚀 Features

- **Semantic Search**: Natural language queries that understand meaning, not just keywords
- **Vector Embeddings**: Uses `Xenova/all-MiniLM-L6-v2` model for generating embeddings
- **Azure Cosmos DB**: Vector search with cosine similarity for fast, accurate results
- **React Frontend**: Modern, responsive UI built with React 19 and TypeScript
- **Azure Functions**: Serverless API backend for scalable search operations

## 🛠️ Technology Stack

### Frontend

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TanStack Query** - Data fetching and caching
- **ESLint** - Code linting

### Backend

- **Azure Functions** - Serverless API
- **TypeScript** - Type safety
- **@xenova/transformers** - Embedding generation
- **@azure/cosmos** - Cosmos DB client

### ETL

- **Node.js** - Data processing
- **fast-csv** - CSV parsing
- **@xenova/transformers** - Embedding generation
- **@azure/cosmos** - Database operations

## 🔍 How It Works

1. **Data Processing**: Raw movie data (CSV) is cleaned and processed
2. **Embedding Generation**: Each movie's title, genre, and plot are converted to vector embeddings
3. **Storage**: Movies and their embeddings are stored in Azure Cosmos DB
4. **Search Query**: User enters a natural language search query
5. **Query Embedding**: The search term is converted to an embedding using the same model
6. **Vector Search**: Cosmos DB performs a vector similarity search (cosine distance)
7. **Results**: Top 5 most similar movies are returned and displayed

## 👤 Author

Keijo Prunt
