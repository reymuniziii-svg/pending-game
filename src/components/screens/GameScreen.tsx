import { useState, useCallback } from 'react'
import { useGameStore, useTimeStore, useCharacterStore, useFinanceStore, useEventStore } from '@/stores'
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Progress, TimeControlBar } from '@/components/ui'
import { PROFILES } from './CharacterSelect'
import { useEventEngine, useTimeFlow } from '@/hooks'
import {
  Calendar,
  DollarSign,
  Heart,
  Brain,
  Users,
  FileText,
  ChevronRight,
  Pause,
  Play,
  AlertTriangle,
  Briefcase,
  Plane,
} from 'lucide-react'
import { formatCurrency, getStatusDisplayName, getStatusColor } from '@/lib/utils'

export function GameScreen() {
  const {
    isInOpeningSequence,
    openingBeatIndex,
    advanceOpeningBeat,
    completeOpeningSequence,
    selectedCharacterId,
    isPaused: isGamePaused,
    setPaused,
  } = useGameStore()

  const { currentMonth, currentYear, getFormattedDate, totalMonthsElapsed, flowMode } = useTimeStore()
  const { profile, status, stats } = useCharacterStore()
  const { bankBalance, getMonthlyNetIncome } = useFinanceStore()
  const { currentEvent, showingOutcome, lastOutcomeText, hideOutcome, clearCurrentEvent } = useEventStore()
  const { handleChoiceSelection } = useEventEngine()

  const [showMonthSummary, setShowMonthSummary] = useState(false)

  // V2: Time flow system
  const { isPaused: isTimePaused, pause, resume, skipMonth } = useTimeFlow({
    enabled: !isInOpeningSequence && !isGamePaused,
    onMonthAdvance: useCallback(() => {
      setShowMonthSummary(true)
      setTimeout(() => setShowMonthSummary(false), 500)
    }, []),
  })

  // Get the profile data
  const currentProfile = PROFILES.find(p => p.id === selectedCharacterId) || profile

  // Opening sequence
  if (isInOpeningSequence && currentProfile) {
    const beats = currentProfile.openingBeats
    const currentBeat = beats[openingBeatIndex]
    const isLastBeat = openingBeatIndex === beats.length - 1

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <Card className="animate-fade-in">
            <CardHeader>
              <div className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                {currentProfile.name}'s Story
              </div>
              <CardTitle className="text-2xl">{currentBeat?.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="narrative text-lg leading-relaxed">
                {currentBeat?.narrative}
              </p>
              <div className="flex justify-between items-center pt-4">
                <div className="flex gap-1">
                  {beats.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i <= openingBeatIndex ? 'bg-accent' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <Button
                  onClick={() => {
                    if (isLastBeat) {
                      completeOpeningSequence()
                    } else {
                      advanceOpeningBeat()
                    }
                  }}
                >
                  {isLastBeat ? 'Begin' : 'Continue'}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Main game screen
  const netIncome = getMonthlyNetIncome()
  const isTimeFlowing = flowMode !== 'paused'

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header Bar */}
      <header className="border-b border-border bg-card px-4 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-serif font-bold text-lg">Pending</h1>
            <div className="h-4 w-px bg-border" />
            <Badge variant="secondary" className="text-xs">
              Year {Math.floor(totalMonthsElapsed / 12) + 1}
            </Badge>
          </div>

          {/* V2: Time Control Bar */}
          <div className="flex-1 max-w-lg mx-4">
            <TimeControlBar
              disabled={!!currentEvent}
              onPause={() => pause()}
              onResume={() => resume()}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setPaused(true)}>
              <Pause className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 grid grid-cols-12 gap-4">
        {/* Left Sidebar - Status */}
        <aside className="col-span-12 md:col-span-3 space-y-4">
          {/* Character Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{currentProfile?.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Age {(currentProfile?.initialAge || 0) + Math.floor(totalMonthsElapsed / 12)}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Immigration Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="outline" className={getStatusColor(status?.type || 'undocumented')}>
                    {getStatusDisplayName(status?.type || 'undocumented')}
                  </Badge>
                </div>
                {status?.expirationDate && (
                  <div className="text-xs text-warning flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Expires {status.expirationDate.month}/{status.expirationDate.year}
                  </div>
                )}
              </div>

              {/* Work/Travel Authorization */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`flex items-center gap-1 ${status?.workAuthorized ? 'text-success' : 'text-danger'}`}>
                  <Briefcase className="h-3 w-3" />
                  {status?.workAuthorized ? 'Can Work' : 'No Work Auth'}
                </div>
                <div className={`flex items-center gap-1 ${status?.canTravel ? 'text-success' : 'text-danger'}`}>
                  <Plane className="h-3 w-3" />
                  {status?.canTravel ? 'Can Travel' : 'Cannot Travel'}
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3 text-danger" />
                      Health
                    </span>
                    <span>{stats.health}%</span>
                  </div>
                  <Progress value={stats.health} className="h-1.5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <Brain className="h-3 w-3 text-warning" />
                      Stress
                    </span>
                    <span>{stats.stress}%</span>
                  </div>
                  <Progress
                    value={stats.stress}
                    className="h-1.5"
                    indicatorClassName={stats.stress > 70 ? 'bg-danger' : stats.stress > 40 ? 'bg-warning' : 'bg-accent'}
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-accent" />
                      Community
                    </span>
                    <span>{stats.communityConnection}%</span>
                  </div>
                  <Progress value={stats.communityConnection} className="h-1.5" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Finances Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Finances
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Savings</span>
                <span className="font-medium">{formatCurrency(bankBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Monthly Net</span>
                <span className={`font-medium ${netIncome >= 0 ? 'text-success' : 'text-danger'}`}>
                  {netIncome >= 0 ? '+' : ''}{formatCurrency(netIncome)}
                </span>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content Area */}
        <main className="col-span-12 md:col-span-6 space-y-4">
          {/* Current Event or Default State */}
          {currentEvent ? (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>{currentEvent.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="narrative">{currentEvent.description}</p>
                {showingOutcome && lastOutcomeText && (
                  <div className="bg-muted/50 p-4 rounded-md border-l-4 border-accent animate-slide-up">
                    <p className="text-sm">{lastOutcomeText}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        hideOutcome()
                        clearCurrentEvent()
                      }}
                    >
                      Continue
                    </Button>
                  </div>
                )}
                {!showingOutcome && (
                  <div className="space-y-2">
                    {currentEvent.choices.map((choice) => (
                      <button
                        key={choice.id}
                        className="choice-btn"
                        onClick={() => handleChoiceSelection(currentEvent.id, choice.id)}
                        disabled={choice.requirements?.some(req => {
                          if (req.type === 'finance' && req.target === 'balance') {
                            return bankBalance < (req.value as number)
                          }
                          return false
                        })}
                      >
                        <span>{choice.text}</span>
                        {choice.costs && choice.costs.length > 0 && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({choice.costs.map(c => c.type === 'money' ? formatCurrency(c.amount) : c.amount).join(', ')})
                          </span>
                        )}
                        {choice.isRecommended && (
                          <span className="text-xs text-accent ml-2">(Recommended)</span>
                        )}
                        {choice.isDangerous && (
                          <span className="text-xs text-danger ml-2">(Risky)</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                {showMonthSummary ? (
                  <div className="animate-fade-in">
                    <p className="text-lg text-muted-foreground mb-2">Time passes...</p>
                    <p className="text-sm text-muted-foreground">{getFormattedDate()}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      {isTimeFlowing
                        ? 'The days pass by...'
                        : 'The days pass quietly. Work, home, waiting.'}
                    </p>
                    {!isTimeFlowing && (
                      <div className="flex justify-center gap-2">
                        <Button onClick={() => resume()}>
                          <Play className="mr-2 h-4 w-4" />
                          Start Time
                        </Button>
                        <Button variant="outline" onClick={() => skipMonth()}>
                          <ChevronRight className="mr-2 h-4 w-4" />
                          Skip Month
                        </Button>
                      </div>
                    )}
                    {isTimeFlowing && (
                      <div className="flex justify-center">
                        <Button variant="outline" onClick={() => pause()}>
                          <Pause className="mr-2 h-4 w-4" />
                          Pause
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Pending Applications */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Pending Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No pending applications.
              </p>
            </CardContent>
          </Card>
        </main>

        {/* Right Sidebar - Resources & Relationships */}
        <aside className="col-span-12 md:col-span-3 space-y-4">
          {/* Key Relationships */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Relationships
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {currentProfile?.initialRelationships.slice(0, 4).map((rel) => (
                <div key={rel.id} className="flex items-center justify-between text-sm">
                  <span>{rel.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {rel.type}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Journey So Far</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Months in US</span>
                <span>{totalMonthsElapsed + ((currentProfile?.initialAge || 0) - (currentProfile?.arrivalAge || 0)) * 12}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Immigration Spent</span>
                <span>{formatCurrency(0)}</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Pause Menu Overlay */}
      {isGamePaused && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Paused</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" onClick={() => setPaused(false)}>
                Resume
              </Button>
              <Button variant="outline" className="w-full" disabled>
                Save Game
              </Button>
              <Button variant="outline" className="w-full" disabled>
                Settings
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => {
                setPaused(false)
                useGameStore.getState().setScreen('title')
              }}>
                Main Menu
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
