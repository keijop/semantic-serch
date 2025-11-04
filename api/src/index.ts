import { app } from '@azure/functions';
import { semanticMovieSearch } from './functions/semanticMovieSearch'; // Import the function

app.setup({
  enableHttpStream: true,
});

app.http('semanticMovieSearch', semanticMovieSearch); // Now it's tied to HTTP request

