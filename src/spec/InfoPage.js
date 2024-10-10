import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import styled, { keyframes, css } from 'styled-components'
import jsonarray from '../json/referentiel-des-lignes.json'

const InfoPage = () => {
  const { arrid } = useParams() // Get the station ID (arrid) from the URL params
  const [data, setData] = useState(null)
  const [selectedLogo, setSelectedLogo] = useState(null) // State to hold the selected logo URL

  // Fetch data for the metro station
  const fetchData = async () => {
    try {
      const response = await fetch(
          `https://prim.iledefrance-mobilites.fr/marketplace/stop-monitoring?MonitoringRef=STIF:StopPoint:Q:${arrid}:`,
          {
            method: 'GET',
            headers: {
              apikey: 'KPqqQPk3gONBzHB50fWrTSC5Ukih11fG',
              Accept: 'application/json'
            }
          }
      )
      const json = await response.json()
      console.log(json) // Log the entire JSON response
      setData(json) // Store the fetched data
    } catch (error) {
      console.error(error)
    }
  }

  // Function to find the metro line by id in the JSON array
  function find_metro_line(id) {
    return jsonarray.find(item => item.id_line === id)
  }

  // Extract the next departure information
  const getNextDepartureInfo = (data) => {
    const stopMonitoringDelivery = data?.Siri?.ServiceDelivery?.StopMonitoringDelivery?.[0]
    if (!stopMonitoringDelivery || !stopMonitoringDelivery.MonitoredStopVisit) {
      return { station: 'Unknown', nextDepartureMinutes: 'N/A', currentStation: 'Unknown', metro_line: null }
    }

    const monitoredStopVisit = stopMonitoringDelivery.MonitoredStopVisit[0]
    const monitoredStopVisitSecond = stopMonitoringDelivery.MonitoredStopVisit[1]
    const currentStation = monitoredStopVisit?.MonitoredVehicleJourney?.MonitoredCall?.StopPointName?.[0]?.value || 'Unknown'
    const firstDepartureTime = monitoredStopVisit?.MonitoredVehicleJourney?.MonitoredCall?.ExpectedDepartureTime
    const secondDepartureTime = monitoredStopVisitSecond?.MonitoredVehicleJourney?.MonitoredCall?.ExpectedDepartureTime
    const metro_line = monitoredStopVisit?.MonitoredVehicleJourney?.LineRef?.value

    const firstDepartureDate = new Date(firstDepartureTime)
    const secondDepartureDate = new Date(secondDepartureTime)
    const currentTime = new Date()
    let firstDepartureMinutes = Math.round((firstDepartureDate - currentTime) / 60000)
    let secondDepartureMinutes = Math.round((secondDepartureDate - currentTime) / 60000)

    if (firstDepartureMinutes < 0 || secondDepartureMinutes < 0) {
      firstDepartureMinutes = 0
      secondDepartureMinutes = 0
    }

    return {
      destination_title: monitoredStopVisit?.MonitoredVehicleJourney?.DestinationName?.[0]?.value || 'Unknown',
      firstDepartureMinutes: firstDepartureMinutes,
      secondDepartureMinutes: secondDepartureMinutes,
      currentStation: currentStation,
      metro_line: metro_line?.substring(11, 17) // Extract the actual line ID
    }
  }

  // Use `useEffect` to fetch data when the component mounts
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 20000) // Fetch data every 20 seconds
    return () => clearInterval(interval) // Cleanup interval on component unmount
  }, [arrid])

  // UseEffect to handle fetching and setting the logo based on the line ID
  useEffect(() => {
    if (data) {
      const { metro_line } = getNextDepartureInfo(data) // Extract metro line info
      if (metro_line) {
        const metro_info = find_metro_line(metro_line) // Find the metro line in the JSON
        if (metro_info && metro_info.picto && metro_info.picto.filename) {
          const logoFilename = metro_info.picto.id
          console.log("id :", logoFilename)
          const logoUrl = `https://data.iledefrance-mobilites.fr/explore/dataset/referentiel-des-lignes/files/${logoFilename}/300`
          setSelectedLogo(logoUrl)
          console.log(logoUrl)
        }
      }
    }
  }, [data]) // Runs whenever `data` is updated

  // Extract information for display
  const { destination_title, firstDepartureMinutes, secondDepartureMinutes, currentStation } = data ? getNextDepartureInfo(data) : {}

  return (
      <PageContainer>
        {data ? (
            <InfoContainer>
              <DepartureInfo>
                <SubLabel>1er métro</SubLabel>
                <DepartureTime isUnderOneMinute={firstDepartureMinutes < 1}>
                  {firstDepartureMinutes}
                </DepartureTime>
              </DepartureInfo>
              <DepartureInfo>
                <SubLabel>2e métro</SubLabel>
                <DepartureTime>{secondDepartureMinutes}</DepartureTime>
              </DepartureInfo>
              <DestinationInfo>
                <p>Destination: {destination_title}</p>
                <p>Current Station: {currentStation}</p>
              </DestinationInfo>
              {selectedLogo && (
                  <div>
                    <h2>Selected Line Logo:</h2>
                    <img src={selectedLogo} alt="Metro Line Logo" style={{ width: 200, height: 200 }} />
                  </div>
              )}
            </InfoContainer>
        ) : (
            <LoadingMessage>Loading...</LoadingMessage>
        )}
      </PageContainer>
  )
}

// Styled Components (unchanged)
const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: black;
  font-family: Arial, sans-serif;
`

const InfoContainer = styled.div`
  background: #000;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  display: flex;
  flex-direction: row;
  gap: 10rem;
  align-items: center;
  color: white;
`

const DepartureInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem 0;
`

const flash = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`

const DepartureTime = styled.span`
  font-size: 10rem;
  font-weight: bold;
  color: ${(props) => (props.isUnderOneMinute ? 'orange' : 'white')};
  ${(props) =>
      props.isUnderOneMinute &&
      css`
        animation: ${flash} 1s infinite;
      `};
  transition: color 0.5s ease, opacity 0.5s ease;
`

const SubLabel = styled.span`
  font-size: 1.5rem;
  color: #ccc;
`

const DestinationInfo = styled.div`
  margin-top: 1rem;
  font-size: 1.2rem;
  color: white;
`

const LoadingMessage = styled.div`
  font-size: 1.5rem;
  color: white;
`

export default InfoPage