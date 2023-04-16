const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const databasePath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: databasePath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//API 1
app.get("/movies/", async (request, response) => {
  const getlistOfMoviesQuery = ` SELECT movie_name FROM movie; `;
  const movieList = await db.all(getlistOfMoviesQuery);

  const movieArr = [];

  const convertSnackCasetoCamelCase = (snackCase) => {
    return {
      movieName: snackCase.movie_name,
    };
  };

  for (let eachMovie of movieList) {
    const convertedCamelCaseMovies = convertSnackCasetoCamelCase(eachMovie);
    movieArr.push(convertedCamelCaseMovies);
  }

  response.send(movieArr);
});
