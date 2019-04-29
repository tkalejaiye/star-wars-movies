import React from 'react'
import ReactTable from 'react-table'
import 'react-table/react-table.css'

export default function MovieInfo(props) {
  return (
    <div>
      <div className="movie-info">
        <h2>{props.movies[props.selectedMovieId].title}</h2>
        <ReactTable
          columns={[
            {
              Header: 'Name',
              accessor: 'name',
              filterable: false,
              width: 250,
              Footer: (
                <strong>Total: {props.selectedMovieCharacters.length}</strong>
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
                  Sum: {props.sumOfCharacterHeights}
                  cm (
                  {props.getHeightInFeetAndInches(props.sumOfCharacterHeights)})
                </strong>
              )
            }
          ]}
          data={props.selectedMovieCharacters}
          resolveData={data => data.map(row => row)}
          filterable
          defaultPageSize={
            props.movies[props.selectedMovieId].characters.length
          }
          showPagination={false}
        />
      </div>
    </div>
  )
}
