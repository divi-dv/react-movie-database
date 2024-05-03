import { useEffect, useState } from "react";
import './App.css'
import StarRating from "./components/StarRating";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function Navbar({children}){
  return (
    <nav className="nav-bar">
      <Logo/>
      {children}
    </nav>
  )
}

function Logo(){
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  )
}

function Search({searchName, setSearchName}){
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={searchName}
      onChange={(e) => setSearchName(e.target.value)}
    />
  )
}

function NumResults({movies}){
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  )
}

export default function App() {
  const [movies, setMovies] = useState(tempMovieData);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchName, setSearchName] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(function(){
    const controller = new AbortController();
    async function fetchMovies(){
      try{
      setIsLoading(true)
      setError("")
      const result = await fetch(`http://www.omdbapi.com/?apikey=f5cf770e&s=${searchName}`, {signal:controller.signal});
      const resultJson = await result.json();
      // Divi notes
      // await is important while connverting the result to json
      setIsLoading(false);
      console.log(resultJson)
      if(!result.ok)
        throw new Error("Error while fetching the results")

      if (resultJson?.Search)
        setMovies(resultJson?.Search)
      else
        throw new Error("No results for this search")
    } catch(err){
      if(err.name!=="AbortError"){
        setError(err.message)
      }
    }
    }
    fetchMovies()
    
    return function (){
      // Divi notes
      // This is the cleanup function
      // the previous HTTP request will be canceled here
      controller.abort();
    }
  },[searchName])

  async function handleMovieSelection(movie){
    if(movie===selectedMovie){
      setSelectedMovie(null)
      return
    }
    setSelectedMovie(movie)
    document.title=movie.Title
  }

  function handleCloseMovie(){
    setSelectedMovie(null)
    document.title="Movie Database"
  }

  function handleAddWatched(movie, userRating){
    movie.userRating = userRating
    setWatched([...watched,movie])
  }

  function handleRemoveWatched(movie){
    let watchedMovies = watched;
    watchedMovies = watchedMovies.filter((m)=>{
      return (m!==movie)
    })
    setWatched(watchedMovies)
  }

  return (
    <>
      <Navbar>
        <Search searchName={searchName} setSearchName={(n)=>setSearchName(n)}/>
        <NumResults movies={movies}/>
      </Navbar>
      <Main>
        <Box>
          {isLoading && !error && 
          <p>Loading...</p>
          }
          {!isLoading && !error &&
          <MovieList movies={movies} onMovieSelected={handleMovieSelection}/>
          }
          {error && 
          <p className="error">{error}</p>
          }
        </Box>
        <Box>
          {selectedMovie?
            <MovieDetails key={selectedMovie.imdbID} selectedMovie={selectedMovie}
            onAddWatched={handleAddWatched} onCloseMovie={handleCloseMovie} watched={watched}/>
          :
            <><WatchedSummary watched={watched}/>
            <WatchedMovieList watched={watched} onRemoveFromWatched={handleRemoveWatched}/></>
          }
        </Box>
      </Main>
    </>
  );
}

function Box({children}){
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && (
        children
      )}
    </div>
  )
}

function Main({children}){
  return (
  <main className="main">
    {children}
  </main>
  )
}

function MovieList({movies, onMovieSelected}){
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} onMovieSelected={onMovieSelected}/>
      ))}
    </ul>
  )
}

function Movie({movie, onMovieSelected}){
  return (
    <li key={movie.imdbID} onClick={()=>onMovieSelected(movie)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  )
}

// function ListBox({children}){
//   const [isOpen1, setIsOpen1] = useState(true);
//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen1((open) => !open)}
//       >
//         {isOpen1 ? "–" : "+"}
//       </button>
//       {isOpen1 && (
//         children
//       )}
//     </div>
//   )
// }

function MovieDetails({selectedMovie, onCloseMovie, onAddWatched, watched}){
  const [movie, setMovie] = useState({})
  const [userRating, setUserRating] = useState(0)
  const isWatched = watched.includes(selectedMovie)

  useEffect(function(){
    async function fetchMovieDetails(){
      const res = await fetch(`http://www.omdbapi.com/?i=${selectedMovie?.imdbID}&apikey=f5cf770e`);
      const resJson = await res.json();
      console.log(resJson)
      setMovie(resJson)
    }
    fetchMovieDetails();
  },[selectedMovie])

  // Divi notes
  // added a listener to the escape key
  useEffect(function(){
    document.addEventListener("keydown", function(e){
      if(e.code==="Escape"){
        onCloseMovie();
      }
    })
    // Divi notes
    // cleanup function to remove the listener from the escape key whenever the 
    // component is unmounted i.e. when movie details is closed
    return function(){
      document.addEventListener("keydown", function(e){
        if(e.code==="Escape"){
          onCloseMovie();
        }
      })}
  },[])

  function handleRatingSelected(rating){
    setUserRating(rating)
  }

  function handleAdd(){
    onAddWatched(selectedMovie,userRating)
    onCloseMovie()
  }

  return(
      <div className="details">
        <header>
          <button className="btn-back" onClick={onCloseMovie}>&larr;</button>
          <img src={movie?.Poster} alt={movie?.Title}/>
          <div className="details-overview">
            <h2>{movie?.Title}</h2>
            <p>{movie.Released} · {movie.Runtime}</p>
            <p>{movie.Genre}</p>
            <p>⭐️ {movie.imdbRating} IMDb Rating</p>
          </div>
        </header>
        <section>
          <div className="rating">
            {!isWatched ?
              <>
                <StarRating onAddRating={handleRatingSelected}/>
                {userRating>0 &&
                  <button className="btn-add" onClick={()=>handleAdd()}>+ Add to Watched</button>
                }
              </>
              :
              <p>
                You rated this movie 
                <span> {selectedMovie.userRating} </span>
                <span>🌟</span>
              </p>
            }
          </div>
          <p><em>{movie.Plot}</em></p>
          <p>Staring {movie.Actors}</p>
          <p>Directed by {movie.Director}</p>
        </section>
      </div>
  )
}

function WatchedSummary({watched}){
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  )
}


function WatchedMovieList({watched, onRemoveFromWatched}){
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} onRemoveFromWatched={onRemoveFromWatched}/>
      ))}
    </ul>
  )
}

function WatchedMovie({movie, onRemoveFromWatched}){
  return (
    <li key={movie.imdbID}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={()=>onRemoveFromWatched(movie)}>x</button>
      </div>
    </li>
  )
}