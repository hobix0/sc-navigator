import React from 'react'

export default function WebsiteCard({ site }) {
  return (
    <a
      href={site.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group glass-hover glass rounded-xl p-6 backdrop-blur-xl border border-white/20 bg-white/5 hover:bg-white/15 hover:border-white/30 transition-all duration-300 flex flex-col h-full"
    >
      {/* Icon */}
      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
        {site.icon}
      </div>

      {/* Content */}
      <div className="flex-grow">
        <h3 className="text-lg font-orbitron font-bold text-white mb-2 group-hover:gradient-text transition-all">
          {site.name}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          {site.desc}
        </p>
      </div>

      {/* Link indicator */}
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center text-cyan-400 text-sm font-medium group-hover:gap-2 gap-0 transition-all">
        Öffnen
        <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
      </div>
    </a>
  )
}
