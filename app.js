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

//API 1 GET
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

//API 2 POST
app.post("/movies/", async (request, response) => {
  const requestBody = request.body;
  const { directorId, movieName, leadActor } = requestBody;
  const postMovieQuery = `
        INSERT INTO 
            movie (director_id,movie_name,lead_actor)
        VALUES 
        (
            ${directorId},
            '${movieName}',
            '${leadActor}'
        );`;
  const dbResponse = await db.run(postMovieQuery);
  //const movieId = dbResponse.lastID;
  //console.log(movieId);
  response.send("Movie Successfully Added");
});

//API 3 GET
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  console.log(movieId);
  const getMovieQuery = `
        SELECT 
          *
        FROM 
          movie 
        WHERE 
          movie_id = ${movieId};
     `;
  const movieObject = await db.get(getMovieQuery);
  const convertSnackCasetoCamelCase = (snackCase) => {
    return {
      movieId: snackCase.movie_id,
      directorId: snackCase.director_id,
      movieName: snackCase.movie_name,
      leadActor: snackCase.lead_actor,
    };
  };

  response.send(convertSnackCasetoCamelCase(movieObject));
});

//API 4 PUT
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const requestBody = request.body;
  const { directorId, movieName, leadActor } = requestBody;
  const updateMovieQuery = `
        UPDATE 
            movie 
        SET 
            director_id = ${directorId},
            movie_name = '${movieName}', 
            lead_actor = '${leadActor}'
        WHERE 
            movie_id = ${movieId};`;
  await db.run(updateMovieQuery);

  response.send("Movie Details Updated");
});

// API 5 DELETE

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  console.log(movieId);
  const deleteQuery = `
        DELETE FROM 
            movie 
        WHERE 
            movie_id = ${movieId};
    `;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

//API 6 GET
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
        SELECT 
            * 
        FROM 
            director;
    `;
  const directorList = await db.all(getDirectorQuery);

  const convertSnackCasetoCamelCase = (snackCase) => {
    return {
      directorId: snackCase.director_id,
      directorName: snackCase.director_name,
    };
  };

  response.send(
    directorList.map((eachDirector) => {
      return convertSnackCasetoCamelCase(eachDirector);
    })
  );
});

//API 7 GET
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getListOfMoviesDirectedBySpecificQuery = `
        SELECT
            movie_name 
        FROM 
            movie
        WHERE 
            director_id = ${directorId};
    `;

  const movieList = await db.all(getListOfMoviesDirectedBySpecificQuery);

  const convertSnackCasetoCamelCase = (snackCase) => {
    return {
      movieName: snackCase.movie_name,
    };
  };

  response.send(
    movieList.map((eachMovie) => convertSnackCasetoCamelCase(eachMovie))
  );
});

module.exports = app;
