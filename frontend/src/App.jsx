import { useState } from 'react'
import { websites, categories } from './data/websites'
import TabNav from './components/TabNav'
import WebsiteCard from './components/WebsiteCard'
import Header from './components/Header'

function App() {
  const [activeTab, setActiveTab] = useState('official')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 smooth-scroll">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Tab Navigation */}
        <TabNav 
          categories={categories}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Content Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
          {websites[activeTab]?.map((site) => (
            <WebsiteCard key={site.id} site={site} />
          ))}
        </div>
      </main>
    </div>
  )
}

export default App

