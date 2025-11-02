import { app } from "@azure/functions";
import "./functions/semanticMovieSearch.js";

app.setup({
  enableHttpStream: true,
});
