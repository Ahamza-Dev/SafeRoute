import { Compass, CloudSun, Activity, Layers } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'

export function AnalysisPathways() {
  const pathways = [
    {
      id: 'map',
      title: 'Geospatial Map Viewport',
      milestone: 'Milestone 8E (Active)',
      active: true,
      description: 'Interactive Leaflet canvas with target coordinate centering and OpenStreetMap geospatial viewport.',
      icon: Compass,
      iconColor: 'text-cyan-400',
    },
    {
      id: 'weather',
      title: 'Atmospheric Curves & Trends',
      milestone: 'Milestone 8F (Active)',
      active: true,
      description: '24-hour hourly temperature trends, precipitation probability projections, and atmospheric metrics.',
      icon: CloudSun,
      iconColor: 'text-blue-400',
    },
    {
      id: 'seismic',
      title: 'Seismic Feed & Epicenters',
      milestone: 'Milestone 8G (Active)',
      active: true,
      description: '30-day seismic activity timeline, magnitude distribution, and focal depth telemetry.',
      icon: Activity,
      iconColor: 'text-orange-400',
    },
    {
      id: 'risk',
      title: 'Multi-Hazard Risk Model',
      milestone: 'Milestone 8H (Active)',
      active: true,
      description: 'Transparent 4-factor contribution breakdown, deterministic synthesis, and research disclaimer.',
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
                className="group p-3.5 rounded-lg bg-slate-950/40 border border-slate-800/80 space-y-2 opacity-90 hover:opacity-100 transition-all duration-200 hover:border-slate-700/80 hover:bg-slate-900/60 hover:shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-slate-900 border border-slate-800 transition-colors duration-200 group-hover:border-slate-700">
                      <Icon className={`w-3.5 h-3.5 ${item.iconColor} transition-transform duration-200 group-hover:scale-110`} aria-hidden="true" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">{item.title}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {item.description}
                </p>

                <div className="pt-1">
                  <Badge variant={item.active ? 'info' : 'secondary'} size="sm" className="text-[10px]">
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
