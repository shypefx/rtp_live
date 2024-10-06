// src/components/HomePage.js
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import stationsData from '../json/referentiel-des-arrets.json'

const HomePage = () => {
  const [stations, setStations] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    setStations(stationsData)
  }, [])

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const handleStationSelect = (arrid) => {
    navigate(`/info/${arrid}`)
  }

  const filteredStations = stations.filter((station) => station.arrname.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div>
      <h1>Search Metro Station</h1>
      <input type='text' placeholder='Search by station name' value={searchTerm} onChange={handleSearchChange} />
      <ul>
        {filteredStations.map((station) => (
          <li key={station.arrid} onClick={() => handleStationSelect(station.arrid)}>
            {station.arrname}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default HomePage
