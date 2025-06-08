import React, { useState, useEffect } from "react";
import "./styles.css";

const DEFAULT_TITLES = [
  "Theri", "Retro", "Dada", "Anegan", "Takkar", 
  "Sivappu Manjal Pachai", "Iraivi", "Raja Rani"
];

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function App() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);

  const fetchMovies = async (searchText) => {
    try {
      const res = await fetch(
        `https://www.omdbapi.com/?s=${encodeURIComponent(searchText)}&apikey=65b78a13`
      );
      const data = await res.json();
      return data.Response === "True" ? data.Search.slice(0, 5) : [];
    } catch {
      return [];
    }
  };

  const fetchMovieDetails = async (imdbID) => {
    try {
      const res = await fetch(
        `https://www.omdbapi.com/?i=${imdbID}&apikey=65b78a13&plot=full`
      );
      const data = await res.json();
      return data.Response === "True" ? data : null;
    } catch {
      return null;
    }
  };

  const loadDefaultMovies = async () => {
    let results = [];
    for (const title of DEFAULT_TITLES) {
      const briefResults = await fetchMovies(title);
      if (briefResults.length > 0) {
        const details = await fetchMovieDetails(briefResults[0].imdbID);
        if (details) results.push(details);
      }
    }
    setMovies(shuffleArray(results));
    setError("");
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.trim() === "") {
      loadDefaultMovies();
      setSelectedMovie(null);
      return;
    }

    const briefResults = await fetchMovies(query);
    if (briefResults.length === 0) {
      setMovies([]);
      setError("No movies found.");
      setSelectedMovie(null);
      return;
    }

    const detailedMovies = [];
    for (const movie of briefResults) {
      const details = await fetchMovieDetails(movie.imdbID);
      if (details) detailedMovies.push(details);
    }

    setMovies(shuffleArray(detailedMovies));
    setError("");
    setSelectedMovie(null);
  };

  useEffect(() => {
    loadDefaultMovies();
  }, []);

  return (
    <div className="app-container">
      <div className="header-bar">
        <h1 className="app-title">🎬 PraZ Movie Search</h1>

        <div className="location-container">
          <label htmlFor="location-select">📍 Location:</label>
          <select
            id="location-select"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="location-select"
          >
            <option value="">Select</option>
            <option value="Chennai">Chennai</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Kolkata">Kolkata</option>
            <option value="Pune">Pune</option>
            <option value="Ahmedabad">Ahmedabad</option>
          </select>
        </div>
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Enter movie name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {location && (
        <p style={{ textAlign: "center", color: "#fff" }}>
          🔍 Showing results for: <strong>{location}</strong>
        </p>
      )}

      {error && <div className="error-msg">{error}</div>}

      <div className="movie-grid">
        {movies.map((movie) => (
          <div
            key={movie.imdbID}
            className="movie-card"
            onClick={() => setSelectedMovie(movie)}
            title="Click for details"
          >
            <img
              src={
                movie.Poster !== "N/A"
                  ? movie.Poster
                  : "https://via.placeholder.com/300x450?text=No+Image"
              }
              alt={movie.Title}
            />
            <div className="movie-info">
              <h2>{movie.Title}</h2>
              <p>{movie.Year}</p>
              <p className="rating">⭐ {movie.imdbRating !== "N/A" ? movie.imdbRating : "–"}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedMovie && (
        <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedMovie(null)}>&times;</button>
            <div className="modal-movie-details">
              <img
                src={
                  selectedMovie.Poster !== "N/A"
                    ? selectedMovie.Poster
                    : "https://via.placeholder.com/300x450?text=No+Image"
                }
                alt={selectedMovie.Title}
              />
              <div className="details-text">
                <h2>{selectedMovie.Title} ({selectedMovie.Year})</h2>
                <p><strong>IMDb Rating:</strong> {selectedMovie.imdbRating}</p>
                <p><strong>Genre:</strong> {selectedMovie.Genre}</p>
                <p><strong>Runtime:</strong> {selectedMovie.Runtime}</p>
                <p><strong>Director:</strong> {selectedMovie.Director}</p>
                <p><strong>Actors:</strong> {selectedMovie.Actors}</p>
                <p><strong>Plot:</strong> {selectedMovie.Plot}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
