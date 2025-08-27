import { Navigate, Route, Routes } from 'react-router'

import { DashboardPage } from './pages/DashboardPage'

function App() {
  return (
    <Routes>
      <Route index element={<Navigate to="/app/dashboard" replace />} />
      <Route index path='/dashboard' Component={DashboardPage} />
    </Routes>
  )
}

export default App
