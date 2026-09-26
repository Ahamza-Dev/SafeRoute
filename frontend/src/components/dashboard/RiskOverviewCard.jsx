import { ShieldAlert, AlertTriangle, Activity } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, RiskBadge } from '@/components/ui'
import { RiskFactorBreakdown } from './RiskFactorBreakdown'

function getLevelDescription(level) {
  switch (level) {
    case 'High':
      return 'Critical risk conditions detected. Severe weather or high seismic proximity observed.'
    case 'Elevated':
      return 'Elevated environmental risk observed. Caution advised for travel and exposed activities.'
    case 'Moderate':
      return 'Moderate atmospheric or seismic indicators present. Standard awareness recommended.'
    case 'Low':
    default:
      return 'Calm baseline environmental conditions observed across active telemetry feeds.'
  }
}

export function RiskOverviewCard({
  riskAssessment,
}) {
  const overallScore = typeof riskAssessment?.overall_score === 'number' ? riskAssessment.overall_score : null
  const overallLevel = riskAssessment?.overall_level || 'Low'
  const factors = riskAssessment?.factors || {}
  const disclaimer = riskAssessment?.disclaimer || (
    'SafeRoute prototype risk assessment based on available public meteorological and seismic data. ' +
    'Not an official alert, forecast, or emergency warning.'
  )

  const levelDescription = getLevelDescription(overallLevel)

  return (
    <Card variant="elevated" className="overflow-hidden border-slate-700/80">
      {/* Card Header with Prototype Context and Risk Level Badge */}
      <CardHeader className="pb-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-semibold text-white">
            <ShieldAlert className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            <span>SafeRoute Prototype Risk Assessment</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
              Prototype Index
            </span>
            <RiskBadge level={overallLevel} showFullLabel />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Score & Core Assessment Hero */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 transition-all duration-200 hover:border-slate-700/80">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Deterministic Composite Index
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {levelDescription}
            </p>
            <div className="text-[11px] text-slate-400 font-mono">
              Index evaluates Seismic (40%), Wind (25%), Precipitation (20%), and Severe Weather (15%).
            </div>
          </div>

          <div className="flex items-baseline sm:flex-col sm:items-end justify-between sm:justify-center gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 font-tabular">
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {overallScore !== null ? overallScore : '—'}
              <span className="text-xs sm:text-sm font-normal text-slate-400 ml-1">/ 100</span>
            </div>
            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" aria-hidden="true" />
              <span>Scale: 0 (Low) – 100 (High)</span>
            </div>
          </div>
        </div>

        {/* Visual 0–100 Scale Meter */}
        <div className="space-y-1.5 px-0.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>0 Low</span>
            <span>25 Moderate</span>
            <span>50 Elevated</span>
            <span>75 High</span>
            <span>100</span>
          </div>

          {/* Meter track with 4 colored severity zones */}
          <div
            className="h-2.5 w-full rounded-full bg-slate-900 border border-slate-800 relative overflow-hidden flex"
            role="meter"
            aria-valuenow={overallScore ?? 0}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={`Score ${overallScore ?? 0} out of 100, ${overallLevel} Risk`}
          >
            <div className="h-full w-1/4 bg-emerald-500/20 border-r border-slate-900" />
            <div className="h-full w-1/4 bg-amber-500/20 border-r border-slate-900" />
            <div className="h-full w-1/4 bg-orange-500/20 border-r border-slate-900" />
            <div className="h-full w-1/4 bg-red-500/20" />

            {/* Pointer / Filled indicator bar */}
            {overallScore !== null && (
              <div
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-emerald-400 via-amber-400 to-orange-400 transition-all duration-500 opacity-80"
                style={{ width: `${Math.max(0, Math.min(100, overallScore))}%` }}
              />
            )}
          </div>
        </div>

        {/* Multi-Hazard Factor Breakdown Component */}
        <RiskFactorBreakdown factors={factors} />

        {/* Prototype Research Disclaimer Notice */}
        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-amber-500/5 border border-amber-500/25 text-xs text-slate-400">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <span className="font-semibold text-amber-300 block">
              Academic & Prototype Disclaimer
            </span>
            <p className="text-slate-400 leading-relaxed">
              {disclaimer} Official alerts, directives, and warnings from government authorities and emergency response agencies always supersede information presented by SafeRoute.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
