import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
function App() {
    return (
        <div>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<DashboardPage />}></Route>
                </Route>
            </Routes>
        </div>
    )
}

export default App