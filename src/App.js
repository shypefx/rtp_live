import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import HomePage from './home/HomePage'
import InfoPage from './spec/InfoPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/info/:arrid' element={<InfoPage />} />
      </Routes>
    </Router>
  )
}

export default App
