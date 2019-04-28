import React, { Component } from 'react'
import ReactLoading from 'react-loading'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import './App.css'
import logo from './assets/star-wars-logo.png'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      movies: [],
      selectedMovieId: '',
      selectedMovieCharacters: [],
      isLoadingCharacters: false,
      isLoadingMovies: false,
      sumOfCharacterHeights: 0,
      error: ''
    }
  }

  // Calls get movies to populate the dropdown
  componentDidMount() {
    this.setState({ isLoadingMovies: true }, () =>
      this.getMovies()
        .then(movies =>
          movies.sort(
            (a, b) => new Date(a.release_date) - new Date(b.release_date) // Sort movies by release date
          )
        )
        .then(movies => this.setState({ movies, isLoadingMovies: false }))
        .catch(error => this.setState({ error: "Couldn't load movies" }))
    )
  }

  // Initial API call to get the list of all Star Wars movies
  getMovies() {
    let movies = []
    return fetch(`https://swapi.co/api/films`)
      .then(res => res.json())
      .then(body => body.results.forEach(movie => movies.push(movie)))
      .then(() => {
        return movies
      })
      .catch(error =>
        this.setState({
          error: "Couldn't load movies :(",
          isLoadingMovies: false
        })
      )
  }

  // Receives the array of characters for a movie and retreives a character object for each one
  // Also updates the sum of character heights as each character is added
  getCharacters(characterArray) {
    let movieCharacters = []
    characterArray.forEach(characterUrl => {
      return fetch(characterUrl)
        .then(res => res.json())
        .then(character => {
          movieCharacters.push(character)
          this.setState(prevState => ({
            //update state with new sum of character height
            sumOfCharacterHeights:
              prevState.sumOfCharacterHeights +
              (character.height === 'unknown' ? 0 : Number(character.height)),
            selectedMovieCharacters: movieCharacters
          }))
        })
        .then(() => {
          // as characters are loaded, add them to selectedMovieCharacters to be rendered in the table
          this.setState({
            selectedMovieCharacters: [...movieCharacters],
            isLoadingCharacters: false
          })
        })
        .catch(error =>
          this.setState({
            error: "Couldn't load characters :(",
            isLoadingCharacters: false
          })
        )
    })
  }

  // Called when a new movie is selected.
  // Sets the selected movie id, clears the movie characters array and character heights, and sets loading characters to true
  handleChange = e => {
    console.log(e.target.value)
    this.setState(
      {
        selectedMovieId: e.target.value,
        selectedMovieCharacters: [],
        isLoadingCharacters: true,
        sumOfCharacterHeights: 0
      },
      () => {
        this.getCharacters(
          this.state.movies[this.state.selectedMovieId].characters
        )
      }
    )
  }

  // Helper method to convert the sum of character heights from cm to feet and inches
  getHeightInFeetAndInches(cm) {
    let feetAndInches = (cm * 0.032808).toFixed(2)
    let feetAndInchesArray = feetAndInches.split('.')

    return `${feetAndInchesArray[0]}ft/${feetAndInchesArray[1]}in`
  }

  render() {
    const {
      movies,
      selectedMovieId,
      selectedMovieCharacters,
      isLoadingCharacters,
      isLoadingMovies,
      error,
      sumOfCharacterHeights
    } = this.state

    return (
      <div className="App">
        <h1>Star Wars Movie Crawler </h1>
        <h2>Select a movie from the dropdown</h2>

        {error ? <p>{error}</p> : null}

        {isLoadingMovies ? (
          <div className="movie-loading">
            <p>Hold on while we fetch the movies for you!</p>
            <ReactLoading
              type={'bubbles'}
              color={'#ffd700'}
              height={100}
              width={100}
            />
          </div>
        ) : (
          <select
            name="movies-dropdown"
            id="movies-dropdown"
            value={selectedMovieId}
            onChange={this.handleChange}
          >
            <option value="" />
            {movies.map((movie, index) => (
              <option key={index} value={index}>
                {movie.title}
              </option>
            ))}
          </select>
        )}

        {selectedMovieId ? (
          <div>
            {selectedMovieCharacters.length > 0 ? (
              <div className="movie-info">
                <h2>{movies[selectedMovieId].title}</h2>
                <ReactTable
                  columns={[
                    {
                      Header: 'Name',
                      accessor: 'name',
                      filterable: false,
                      width: 250,
                      Footer: (
                        <strong>Total: {selectedMovieCharacters.length}</strong>
                      )
                    },
                    { Header: 'Gender', accessor: 'gender', width: 250 },
                    {
                      Header: 'Height',
                      accessor: 'height',
                      filterable: false,
                      width: 250,
                      Footer: (
                        <strong>
                          Sum: {sumOfCharacterHeights}
                          cm (
                          {this.getHeightInFeetAndInches(sumOfCharacterHeights)}
                          )
                        </strong>
                      )
                    }
                  ]}
                  data={selectedMovieCharacters}
                  resolveData={data => data.map(row => row)}
                  filterable
                  defaultPageSize={movies[selectedMovieId].characters.length}
                  showPagination={false}
                />
              </div>
            ) : isLoadingCharacters ? (
              <ReactLoading
                type={'bubbles'}
                color={'#ffd700'}
                height={100}
                width={100}
              />
            ) : null}
          </div>
        ) : (
          <div>
            <img src={logo} alt="Star Wars Logo" height="250" width="350" />
          </div>
        )}
      </div>
    )
  }
}

export default App
