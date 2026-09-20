import { ShieldAlert, AlertTriangle, Activity } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, RiskBadge } from '@/components/ui'

export function RiskOverviewCard({
  riskAssessment,
}) {
  const overallScore = riskAssessment?.overall_score
  const overallLevel = riskAssessment?.overall_level || 'Low'
  const disclaimer = riskAssessment?.disclaimer || (
    'SafeRoute prototype risk assessment based on available public meteorological and seismic data. ' +
    'Not an official emergency alert or evacuation directive.'
  )

  return (
    <Card variant="elevated" className="overflow-hidden border-slate-700/80">
      <CardHeader className="pb-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-semibold text-white">
            <ShieldAlert className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            <span>Composite Situational Risk Assessment</span>
          </CardTitle>
          <RiskBadge level={overallLevel} showFullLabel />
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Score and Core Assessment Hero */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Deterministic Composite Index
            </div>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Weighted composite index evaluating concurrent seismic proximity (40%), wind velocity (25%),
              precipitation intensity (20%), and severe atmospheric conditions (15%).
            </p>
          </div>

          <div className="flex items-baseline sm:flex-col sm:items-end justify-between sm:justify-center gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 font-tabular">
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {overallScore !== undefined && overallScore !== null ? overallScore : '—'}
              <span className="text-xs sm:text-sm font-normal text-slate-400 ml-1">/ 100</span>
            </div>
            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" />
              <span>Index: 0 (Low) – 100 (High)</span>
            </div>
          </div>
        </div>

        {/* Prototype Research Disclaimer */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-slate-400">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-0.5">
            <span className="font-semibold text-amber-300">Prototype Assessment Notice</span>
            <p className="text-slate-400 leading-relaxed">{disclaimer}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
