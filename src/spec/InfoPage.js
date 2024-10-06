import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import styled, { keyframes, css } from 'styled-components'

const InfoPage = () => {
  const { arrid } = useParams()
  const [data, setData] = useState(null)

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
      setData(json)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 20000) // Fetch data every 20 seconds
    return () => clearInterval(interval) // Cleanup interval on component unmount
  }, [arrid])

  const getNextDepartureInfo = (data) => {
    const stopMonitoringDelivery = data?.Siri?.ServiceDelivery?.StopMonitoringDelivery?.[0]
    if (!stopMonitoringDelivery || !stopMonitoringDelivery.MonitoredStopVisit) {
      return { station: 'Unknown', nextDepartureMinutes: 'N/A', currentStation: 'Unknown' }
    }
    const monitoredStopVisit = stopMonitoringDelivery.MonitoredStopVisit[0]
    const monitoredStopVisitSecond = stopMonitoringDelivery.MonitoredStopVisit[1]
    const currentStation = monitoredStopVisit?.MonitoredVehicleJourney?.MonitoredCall?.StopPointName?.[0]?.value || 'Unknown'
    const firstDepartureTime = monitoredStopVisit?.MonitoredVehicleJourney?.MonitoredCall?.ExpectedDepartureTime
    const secondDepartureTime = monitoredStopVisitSecond?.MonitoredVehicleJourney?.MonitoredCall?.ExpectedDepartureTime
    const firstDepartureDate = new Date(firstDepartureTime)
    const secondDepartureDate = new Date(secondDepartureTime)
    const currentTime = new Date()
    console.log(' First at station : ', monitoredStopVisit?.MonitoredVehicleJourney?.MonitoredCall?.VehicleAtStop)
    console.log(' Second at station : ', monitoredStopVisitSecond?.MonitoredVehicleJourney?.MonitoredCall?.VehicleAtStop)
    let firstDepartureMinutes = Math.round((firstDepartureDate - currentTime) / 60000)
    let secondDepartureMinutes = Math.round((secondDepartureDate - currentTime) / 6000 / 10)
    if (firstDepartureMinutes < 0 || secondDepartureMinutes < 0) {
      firstDepartureMinutes = 0
      secondDepartureMinutes = 0
    }

    return {
      destination_title: monitoredStopVisit?.MonitoredVehicleJourney?.DestinationName?.[0].value || 'Unknown',
      firstDepartureMinutes: firstDepartureMinutes,
      secondDepartureMinutes: secondDepartureMinutes,
      currentStation: currentStation
    }
  }

  const { destination_title, firstDepartureMinutes, secondDepartureMinutes, currentStation } = data ? getNextDepartureInfo(data) : {}

  return (
    <PageContainer>
      {data ? (
        <InfoContainer>
          <DepartureInfo>
            <SubLabel>1er métro</SubLabel>
            <DepartureTime isUnderOneMinute={firstDepartureMinutes < 1}>{firstDepartureMinutes}</DepartureTime>
          </DepartureInfo>
          <DepartureInfo>
            <SubLabel>2e métro</SubLabel>
            <DepartureTime>{secondDepartureMinutes}</DepartureTime>
          </DepartureInfo>
          <DestinationInfo>
            <p>Destination: {destination_title}</p>
            <p>Current Station: {currentStation}</p>
            {/* Add additional information here */}
          </DestinationInfo>
        </InfoContainer>
      ) : (
        <LoadingMessage>Loading...</LoadingMessage>
      )}
    </PageContainer>
  )
}

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
  transition:
    color 0.5s ease,
    opacity 0.5s ease;
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
