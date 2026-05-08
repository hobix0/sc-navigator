import React from 'react'

export default function Header() {
  return (
    <header className="relative border-b border-white/10 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-orbitron font-bold gradient-text mb-2">
              ◈ SC Navigator
            </h1>
            <p className="text-gray-300 text-sm md:text-base">
              Community-Dashboard für Star Citizen — alle wichtigen Tools auf einen Blick
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>
    </header>
  )
}
