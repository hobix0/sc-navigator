import React from 'react'

export default function TabNav({ categories, activeTab, onTabChange }) {
  return (
    <div className="glass rounded-xl p-1 inline-flex gap-2 backdrop-blur-xl border border-white/20 bg-white/10">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onTabChange(cat.id)}
          className={`px-6 py-3 rounded-lg font-orbitron font-semibold transition-all duration-300 whitespace-nowrap ${
            activeTab === cat.id
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-cyan-500/50'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          {cat.icon} {cat.name}
        </button>
      ))}
    </div>
  )
}
