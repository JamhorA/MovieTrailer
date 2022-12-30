import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./App.css";
import MovieCard from "./components/MovieCard";
import YouTube from "react-youtube";

function App() {
  const imagePath = "https://image.tmdb.org/t/p/w1280";
  const apiUrl = "https://api.themoviedb.org/3";
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState({});
  const [searchKey, setSearchKey] = useState("");
  const [playTrailer, setPlayTrailer] = useState(false);
  const [slideNumber, setSlideNumber] = useState(0);
  const [isMoved, setIsMoved] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    let storedItems = localStorage.getItem("recentlyViewed");
    if (storedItems) {
      setRecentlyViewed(JSON.parse(storedItems));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  const addToRecentlyViewed = (item) => {
    if (item.id === item.id) {
      setRecentlyViewed((prevItems) => [item, ...prevItems.slice(0, 4)]);
    } else return;
    console.log(item.id);
  };
  const clearAll = () => setRecentlyViewed([]);

  const fetchMovies = async (searchKey) => {
    const type = searchKey ? "search" : "discover";
    const {
      data: { results },
    } = await axios.get(`${apiUrl}/${type}/movie`, {
      params: {
        api_key: process.env.REACT_APP_MOVIE_API_KEY,
        query: searchKey,
      },
    });
    setMovies(results);
    await selectMovie(results[0]);
  };
  const fetchMovie = async (id) => {
    const { data } = await axios.get(`${apiUrl}/movie/${id}`, {
      params: {
        api_key: process.env.REACT_APP_MOVIE_API_KEY,
        append_to_response: "videos",
      },
    });
    return data;
  };
  const selectMovie = async (movie) => {
    setPlayTrailer(false);
    const data = await fetchMovie(movie.id);
    setSelectedMovie(data);
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const renderMovies = () =>
    movies.map((movie) => (
      <MovieCard key={movie.id} movie={movie} selectMovie={selectMovie} />
    ));
    
  const multi1 = () => {
    setPlayTrailer(true);
    addToRecentlyViewed(selectedMovie);
  };
  // start slider
  const listRef = useRef();

  function List() {
    const handelClick = (direction) => {
      setIsMoved(true);
      let distance = listRef.current.getBoundingClientRect().x - 50;

      if (direction === "left" && slideNumber > 0) {
        setSlideNumber(slideNumber - 1);
        listRef.current.style.transform = `translateX(${300 + distance}px)`;
      }
      if (direction === "right" && slideNumber < 10) {
        setSlideNumber(slideNumber + 1);

        listRef.current.style.transform = `translateX(${-200 + distance}px)`;
      }
    };
    return (
      <div className="list">
        <span className="listTitle">Continue to watch</span>
        <div className="wrapper">
          <a
            className="prev1"
            onClick={() => handelClick("left")}
            style={{ display: !isMoved && "none" }}
          >
            &#10094;
          </a>
          <div className="container" ref={listRef}>
            {renderMovies()}
          </div>
          <a className="next1" onClick={() => handelClick("right")}>
            &#10095;
          </a>
        </div>
      </div>
    );
  }
  // end slider
  // start viewed
  const listRef1 = useRef();
  function Viewed() {
    return (
      <div className="list list1">
        {recentlyViewed ? (
          <button className="clr_btn" onClick={() => clearAll()}>
            Clear All
          </button>
        ) : null}
        {playTrailer ? (
          <span className="listTitle">Recently Watched</span>
        ) : null}
        <div className="wrapper">
          <div className="container recently_watched" ref={listRef1}>
            {recentlyViewed.map((item) => (
              <MovieCard key={item.id} movie={item} />
            ))}
            {console.log(recentlyViewed)}
          </div>
        </div>
      </div>
    );
  }
  // end viewed

  const searchMovies = (e) => {
    e.preventDefault();
    fetchMovies(searchKey);
  };
  const renderTrailer = () => {
    const trailer = selectedMovie.videos.results.find(
      (vid) => vid.name === "Official Trailer"
    );
    const key = trailer ? trailer.key : selectedMovie.videos.results[0].key;
    return (
      <YouTube
        videoId={key}
        className={"youtube-container"}
        opts={{
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 1,
            controls: 0,
          },
        }}
      />
    );
  };
  return (
    <div className="App">
      <header className={"header"}>
        <div className={"header-content max-center"}>
          <span className="navbar_title">Movie Trailer App</span>
          <form onSubmit={searchMovies}>
            <input
              className="search_input"
              type="text"
              onChange={(e) => setSearchKey(e.target.value)}
            />
            <button className="search_btn" type={"submit"}>
              Search
            </button>
          </form>
        </div>
      </header>
      <div
        className="hero"
        style={{
          backgroundImage: `url(${imagePath}${selectedMovie.backdrop_path})`,
        }}
      >
        <div className=" hero-content max-center">
          {playTrailer ? (
            <button
              className={"button button-close"}
              onClick={() => setPlayTrailer(false)}
            >
              Close
            </button>
          ) : null}
          {selectedMovie.videos && playTrailer ? renderTrailer() : null}

          <button className={"button"} onClick={() => multi1()}>
            Play Trailer
          </button>

          <h1 className={"hero-title"}>{selectedMovie.title}</h1>
          <span>IMDB Rating: {selectedMovie.vote_average}</span>
          {selectedMovie.overview ? (
            <p className={"hero-overview"}>{selectedMovie.overview}</p>
          ) : null}
        </div>
      </div>
      {List()}
      {Viewed()}
    </div>
  );
}

export default App;
