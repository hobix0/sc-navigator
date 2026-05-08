import { useState } from 'react'
import Header from './components/Header.jsx'
import Dashboard from './components/Dashboard.jsx'
import CommodityTracker from './components/CommodityTracker.jsx'
import FleetManager from './components/FleetManager.jsx'
import QuickLinks from './components/QuickLinks.jsx'

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="app">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main>
        {activeTab === 'dashboard'   && <Dashboard   setActiveTab={setActiveTab} />}
        {activeTab === 'commodities' && <CommodityTracker />}
        {activeTab === 'fleet'       && <FleetManager />}
        {activeTab === 'links'       && <QuickLinks />}
      </main>
    </div>
  )
}
