import { Compass, CloudSun, Activity, Layers } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'

export function AnalysisPathways() {
  const pathways = [
    {
      id: 'map',
      title: 'Geospatial Map Viewport',
      milestone: 'Milestone 8E',
      description: 'Interactive Leaflet canvas with target coordinate centering, epicenter radiuses, and hazard layers.',
      icon: Compass,
      iconColor: 'text-cyan-400',
    },
    {
      id: 'weather',
      title: 'Atmospheric Curves & Trends',
      milestone: 'Milestone 8F',
      description: 'Hourly precipitation accumulation, barometric pressure shifts, and wind velocity charts.',
      icon: CloudSun,
      iconColor: 'text-blue-400',
    },
    {
      id: 'seismic',
      title: 'Seismic Feed & Epicenters',
      milestone: 'Milestone 8G',
      description: 'Interactive seismic event timeline, magnitude filters, and focal depth distribution.',
      icon: Activity,
      iconColor: 'text-orange-400',
    },
    {
      id: 'risk',
      title: 'Multi-Hazard Risk Model',
      milestone: 'Milestone 8H',
      description: 'Dynamic factor weight simulations and situational risk sensitivity breakdown.',
      icon: Layers,
      iconColor: 'text-emerald-400',
    },
  ]

  return (
    <Card variant="default" className="overflow-hidden border-slate-700/80 bg-slate-900/40">
      <CardHeader className="pb-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-semibold text-white">
            <Layers className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            <span>Deep-Analysis & Visualization Pathways</span>
          </CardTitle>
          <span className="text-[11px] text-slate-400">Roadmap Modules</span>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {pathways.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-800/80 space-y-2 opacity-85 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-slate-900 border border-slate-800">
                      <Icon className={`w-3.5 h-3.5 ${item.iconColor}`} aria-hidden="true" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200">{item.title}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {item.description}
                </p>

                <div className="pt-1">
                  <Badge variant="secondary" size="sm" className="text-[10px]">
                    {item.milestone}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
