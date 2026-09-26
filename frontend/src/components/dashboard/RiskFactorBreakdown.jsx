import { useMemo } from 'react'
import { Activity, Wind, CloudRain, CloudLightning, Info } from 'lucide-react'
import { Badge } from '@/components/ui'

const FACTOR_METADATA = [
  {
    key: 'earthquake',
    title: 'Seismic Proximity & Impact',
    weight: 0.40,
    weightPercent: 40,
    icon: Activity,
    colorClass: 'text-orange-400',
    barClass: 'bg-orange-400',
    badgeVariant: 'warning',
  },
  {
    key: 'wind',
    title: 'Wind Velocity & Gusts',
    weight: 0.25,
    weightPercent: 25,
    icon: Wind,
    colorClass: 'text-cyan-400',
    barClass: 'bg-cyan-400',
    badgeVariant: 'info',
  },
  {
    key: 'precipitation',
    title: 'Precipitation Intensity',
    weight: 0.20,
    weightPercent: 20,
    icon: CloudRain,
    colorClass: 'text-blue-400',
    barClass: 'bg-blue-400',
    badgeVariant: 'info',
  },
  {
    key: 'severe_weather',
    title: 'Severe Atmospheric Phenomena',
    weight: 0.15,
    weightPercent: 15,
    icon: CloudLightning,
    colorClass: 'text-purple-400',
    barClass: 'bg-purple-400',
    badgeVariant: 'secondary',
  },
]

function getScoreSeverityColor(score) {
  if (score >= 75) return 'text-red-400'
  if (score >= 50) return 'text-orange-400'
  if (score >= 25) return 'text-amber-400'
  return 'text-emerald-400'
}

function getScoreSeverityLabel(score) {
  if (score >= 75) return 'High Factor Impact'
  if (score >= 50) return 'Elevated Factor Impact'
  if (score >= 25) return 'Moderate Factor Impact'
  return 'Minimal Factor Impact'
}

export function RiskFactorBreakdown({ factors = {} }) {
  const factorList = useMemo(() => {
    return FACTOR_METADATA.map((meta) => {
      const factorData = factors?.[meta.key] || {}
      const rawScore = typeof factorData.score === 'number' ? factorData.score : null
      const explanation = factorData.explanation || 'Telemetry feed for this factor is currently unavailable.'
      const details = factorData.details || null
      const contribution = rawScore !== null ? (rawScore * meta.weight).toFixed(1) : '—'

      return {
        ...meta,
        score: rawScore,
        explanation,
        details,
        contribution,
      }
    })
  }, [factors])

  // Identify highest contributing factor for "Why this score?" synthesis
  const primaryDriver = useMemo(() => {
    const scored = factorList.filter((f) => typeof f.score === 'number')
    if (!scored.length) return null
    return scored.reduce((prev, curr) => (curr.score > prev.score ? curr : prev))
  }, [factorList])

  return (
    <div className="space-y-4 pt-3 border-t border-slate-800/80">
      {/* Section Sub-heading */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" aria-hidden="true" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Multi-Hazard Factor Breakdown
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          4 Weighted Environmental Vectors
        </span>
      </div>

      {/* Factor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {factorList.map((factor) => {
          const Icon = factor.icon
          const scoreDisplay = factor.score !== null ? factor.score : '—'
          const scoreColor = factor.score !== null ? getScoreSeverityColor(factor.score) : 'text-slate-400'
          const severityLabel = factor.score !== null ? getScoreSeverityLabel(factor.score) : 'Data Unavailable'

          return (
            <div
              key={factor.key}
              className="group p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2.5 transition-all duration-200 hover:border-slate-700/90 hover:bg-slate-900/80 hover:shadow-xs"
            >
              {/* Header: Title + Weight + Score */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-slate-900 border border-slate-800 transition-colors duration-200 group-hover:border-slate-700">
                    <Icon className={`w-3.5 h-3.5 ${factor.colorClass} transition-transform duration-200 group-hover:scale-110`} aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {factor.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {factor.weightPercent}% Model Weight
                    </span>
                  </div>
                </div>

                <div className="text-right font-tabular shrink-0">
                  <span className={`text-sm font-bold ${scoreColor}`}>
                    {scoreDisplay}
                    <span className="text-[10px] font-normal text-slate-400 ml-0.5">/100</span>
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono">
                    +{factor.contribution} pts
                  </div>
                </div>
              </div>

              {/* Visual Factor Score Bar */}
              <div className="space-y-1">
                <div
                  className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800"
                  role="progressbar"
                  aria-valuenow={factor.score ?? 0}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${factor.title} factor score`}
                >
                  <div
                    className={`h-full rounded-full ${factor.barClass} transition-all duration-500 ease-out`}
                    style={{ width: `${Math.max(0, Math.min(100, factor.score ?? 0))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{severityLabel}</span>
                  <span>{factor.weightPercent}% Weight</span>
                </div>
              </div>

              {/* Structured Backend Explanation */}
              <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/40 p-2 rounded border border-slate-800/60 transition-colors duration-200 group-hover:border-slate-700/60">
                {factor.explanation}
              </p>
            </div>
          )
        })}
      </div>

      {/* "Why This Score?" Synthesis Box */}
      <div className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-800/80 space-y-2 transition-all duration-200 hover:border-slate-700/60">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-200">
            Why this score? — Deterministic Synthesis
          </span>
          {primaryDriver && (
            <Badge variant="secondary" size="sm" className="text-[10px]">
              Primary: {primaryDriver.title}
            </Badge>
          )}
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {primaryDriver && primaryDriver.score > 0
            ? `The primary contributor to this situational assessment is ${primaryDriver.title.toLowerCase()} (Score: ${primaryDriver.score}/100, contributing +${primaryDriver.contribution} points), reflecting observed public data: "${primaryDriver.explanation}".`
            : primaryDriver && primaryDriver.score === 0
            ? 'All observed meteorological and seismic vectors currently indicate calm, baseline environmental conditions across public USGS and Open-Meteo feeds.'
            : 'Situational hazard factors are currently unavailable or evaluating active telemetry feeds.'}
        </p>

        <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-900 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>Formula: Score = (Seismic × 40%) + (Wind × 25%) + (Precipitation × 20%) + (Severe Weather × 15%)</span>
        </div>
      </div>
    </div>
  )
}
