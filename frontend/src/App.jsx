import { ShieldCheck } from 'lucide-react'

function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-2xl text-center space-y-4">
        <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          SafeRoute Frontend Foundation
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          React, Vite, Tailwind CSS, and core UI dependencies are initialized and verified.
        </p>
        <div className="pt-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Foundation Ready (Milestone 6)
          </span>
        </div>
      </div>
    </main>
  )
}

export default App
