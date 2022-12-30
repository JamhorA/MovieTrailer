import React from 'react'

const MovieCard = ({movie, selectMovie}) => {
    const imagePath = "https://image.tmdb.org/t/p/w500";
    // console.log(movie)
  return (
    <div className={"movie-card"} onClick={() => selectMovie(movie)}>
        {movie.poster_path ? <img className={"movie-cover"} src={`${imagePath}${movie.poster_path}`} alt=''/> 
        : <div className={"movie-placeholder"}>No Image found</div>
        }
        <h5 className={"movie-title"}>{movie.title}</h5>

    </div>
  )
}

export default MovieCard