// src/components/HomePage.js
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import stationsData from '../json/referentiel-des-arrets.json'
import linesData from '../json/referentiel-des-lignes.json'
import styled from 'styled-components'
import jsonarray from "../json/referentiel-des-lignes.json";

const HomePage = () => {
    const [stations, setStations] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredStations, setFilteredStations] = useState([])
    const [showDropdown, setShowDropdown] = useState(false)
    const navigate = useNavigate()
    const searchRef = useRef(null)

    useEffect(() => {
        setStations(stationsData)
    }, [])

    useEffect(() => {
        if (searchTerm) {
            const filtered = stations
                .filter(station => station.arrname.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(station => ({
                    ...station,
                    logoUrl: getLogoUrl(station.arrid)
                }))
            setFilteredStations(filtered)
            setShowDropdown(true)
        } else {
            setFilteredStations([])
            setShowDropdown(false)
        }
    }, [searchTerm, stations])

    function find_metro_line(id) {
        return jsonarray.find(item => item.id_line === id)
    }

    const getLogoUrl = (lineId) => {
        console.log("lineId = ", lineId)
        const metro_info = find_metro_line(lineId)
        console.log("line : ", metro_info)
        if (metro_info && metro_info.picto && metro_info.picto.id) {
            console.log(metro_info.picto.id)
            return `https://data.iledefrance-mobilites.fr/explore/dataset/referentiel-des-lignes/files/${metro_info.picto.id}/100` // Adjusted size to 100x100
        }
        return null
    }

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value)
    }

    const handleStationSelect = (arrid) => {
        navigate(`/info/${arrid}`)
        setShowDropdown(false)
        setSearchTerm('')
    }

    const handleClickOutside = (event) => {
        if (searchRef.current && !searchRef.current.contains(event.target)) {
            setShowDropdown(false)
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div>
            <h1>Search Metro Station</h1>
            <SearchContainer ref={searchRef}>
                <SearchInput
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Type station name..."
                    onFocus={() => setShowDropdown(true)}
                />
                {showDropdown && (
                    <Dropdown>
                        {filteredStations.length > 0 ? (
                            filteredStations.map((station) => (
                                <DropdownItem
                                    key={station.arrid}
                                    onClick={() => handleStationSelect(station.arrid)}
                                >
                                    {station.logoUrl && (
                                        <Logo src={station.logoUrl} alt={`${station.arrname} logo`} />
                                    )}
                                    {station.arrname}
                                </DropdownItem>
                            ))
                        ) : (
                            <DropdownItem>No results found</DropdownItem>
                        )}
                    </Dropdown>
                )}
            </SearchContainer>
        </div>
    )
}

export default HomePage

// Styled components
const SearchContainer = styled.div`
    position: relative;
    width: 300px;
    margin: 0 auto;
`

const SearchInput = styled.input`
    width: 100%;
    padding: 8px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    outline: none;
    box-sizing: border-box;
`

const Dropdown = styled.ul`
    position: absolute;
    width: 100%;
    max-height: 200px;
    overflow-y: auto;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-top: 5px;
    padding: 0;
    list-style: none;
    z-index: 1000;
`

const DropdownItem = styled.li`
    display: flex;
    align-items: center;
    padding: 10px;
    cursor: pointer;
    &:hover {
        background-color: #f0f0f0;
    }
`

const Logo = styled.img`
    width: 30px;  // Reduced width for better fit
    height: 30px; // Reduced height for better fit
    margin-right: 8px;
`
