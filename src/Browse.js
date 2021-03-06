import React, { Component } from 'react'
import ProfileResult from './ProfileResult'
import SearchInput from './SearchInput'
import { getProfiles } from './api'
import AppScreen from './AppScreen'

function pluralizeResults(length) {
  if (length === 1) {
    return 'result'
  }
  return 'results'
}

export default class Browse extends Component {
  state = {
    loading: true,
    searchTerms: [],
    search: '',
    results: null,
    queried: false,
    error: null
  }

  constructor(props) {
    super(props)

    getProfiles(props.token)
      .then(results => {
        this.setState({ results, loading: false })
      })
      .catch(() =>
        this.setState({ error: 'Unable to load profiles. Try again later.' })
      )
  }

  handleSearch = (reset = false) => {
    this.setState({ loading: true })
    const { token } = this.props
    const { searchTerms, search } = this.state
    const searchArray = search === '' ? [] : [search]
    const searchString = searchTerms
      .concat(searchArray)
      .join(' ')
      .toLowerCase()

    const query = reset ? '' : searchString

    getProfiles(token, query).then(results => {
      const canReset = !reset && searchString !== ''
      this.setState({ results, queried: canReset, loading: false })
    })
  }

  handleChange = tags => {
    this.setState(
      { searchTerms: tags.map(tag => tag.value) },
      this.handleSearch
    )
  }

  handleInputChange = value => {
    this.setState({ search: value })
    return value
  }

  render() {
    const { error, loading, results } = this.state
    return (
      <AppScreen>
        <SearchInput
          value={this.state.searchTerms}
          inputValue={this.state.search}
          onChange={this.handleChange}
          onInputChange={this.handleInputChange}
          onSubmit={this.handleSearch}
        />
        <div style={{ padding: '1em 0' }}>
          {(error !== null && error) ||
            (results === null && <p>Loading...</p>) || (
              <div>
                <p>
                  Showing {results.length}{' '}
                  {pluralizeResults(this.state.results.length)}.{' '}
                  {loading && <span>Loading...</span>}
                  {this.state.queried && (
                    <button
                      onClick={() => {
                        this.setState({
                          searchTerms: [],
                          search: ''
                        })
                        this.handleSearch(true)
                        this.setState({
                          queried: false
                        })
                      }}
                    >
                      Clear search
                    </button>
                  )}
                </p>
                <div>
                  {this.state.results.map(result => (
                    <ProfileResult key={result.id} {...result} />
                  ))}
                </div>
              </div>
            )}
        </div>
      </AppScreen>
    )
  }
}
