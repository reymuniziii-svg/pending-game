import { useState, useCallback, useMemo } from 'react'
import { useGameStore, useTimeStore, useCharacterStore, useFinanceStore, useEventStore, useFormStore } from '@/stores'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Progress,
  TimeControlBar,
  SceneWrapper,
  useSceneType,
  DecisionCard,
  LoadingSpinner,
} from '@/components/ui'
import { PROFILES } from './CharacterSelect'
import { useEventEngine, useTimeFlow } from '@/hooks'
import {
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
  Clock,
  Home,
  CalendarDays,
} from 'lucide-react'
import { formatCurrency, getStatusDisplayName, getStatusColor, cn } from '@/lib/utils'

// Get character class name for styling
function getCharacterClass(characterId: string | null): string {
  switch (characterId) {
    case 'maria': return 'character-maria'
    case 'david': return 'character-david'
    case 'fatima': return 'character-fatima'
    case 'elena': return 'character-elena'
    default: return ''
  }
}

// Determine if event is bureaucratic/system or life event
function isSystemEvent(tags?: string[]): boolean {
  if (!tags) return false
  const systemTags = ['uscis', 'immigration', 'forms', 'court', 'legal', 'application', 'deadline']
  return tags.some(tag => systemTags.includes(tag))
}

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

  const {
    currentMonth,
    currentYear,
    getFormattedDate,
    totalMonthsElapsed,
    flowMode,
    deadlinePressure,
  } = useTimeStore()

  const { profile, status, stats, flags } = useCharacterStore()
  const { bankBalance, getMonthlyNetIncome, totalImmigrationSpending } = useFinanceStore()
  const { currentEvent, showingOutcome, lastOutcomeText, hideOutcome, clearCurrentEvent } = useEventStore()
  const { activeApplications } = useFormStore()
  const { handleChoiceSelection } = useEventEngine()

  const [showMonthSummary, setShowMonthSummary] = useState(false)

  // V2: Time flow system
  const { isPaused: isTimePaused, pause, resume, skipMonth } = useTimeFlow({
    enabled: !isInOpeningSequence && !isGamePaused,
    onMonthAdvance: useCallback(() => {
      setShowMonthSummary(true)
      setTimeout(() => setShowMonthSummary(false), 800)
    }, []),
  })

  // Get the profile data
  const currentProfile = PROFILES.find(p => p.id === selectedCharacterId) || profile
  const characterClass = getCharacterClass(selectedCharacterId)

  // V2: Determine scene type based on current event
  const sceneType = useSceneType(currentEvent?.sceneType, currentEvent?.tags)

  // V2: Determine if current event is system/bureaucratic
  const isCurrentEventSystem = useMemo(() => {
    return currentEvent ? isSystemEvent(currentEvent.tags) : false
  }, [currentEvent])

  // Check if player can afford a choice
  const canAffordChoice = useCallback((choice: { costs?: { type: string; amount: number }[] }) => {
    if (!choice.costs) return true
    const moneyCost = choice.costs.find(c => c.type === 'money')
    if (moneyCost && bankBalance < moneyCost.amount) return false
    return true
  }, [bankBalance])

  // Opening sequence
  if (isInOpeningSequence && currentProfile) {
    const beats = currentProfile.openingBeats
    const currentBeat = beats[openingBeatIndex]
    const isLastBeat = openingBeatIndex === beats.length - 1

    return (
      <SceneWrapper type="home" className={cn('min-h-screen flex items-center justify-center p-4', characterClass)}>
        <div className="max-w-2xl w-full">
          <Card className="animate-fade-in character-accent-border">
            <CardHeader>
              <div className="text-sm text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                <Home className="h-4 w-4" style={{ color: 'var(--character-color)' }} />
                {currentProfile.name}'s Story
              </div>
              <CardTitle className="text-2xl">{currentBeat?.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="character-quote">
                {currentBeat?.narrative}
              </p>
              <div className="flex justify-between items-center pt-4">
                <div className="flex gap-1.5">
                  {beats.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-2.5 h-2.5 rounded-full transition-all duration-300',
                        i <= openingBeatIndex ? 'scale-100' : 'scale-75 opacity-50'
                      )}
                      style={{
                        backgroundColor: i <= openingBeatIndex ? 'var(--character-color)' : undefined,
                      }}
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
                  className="group"
                >
                  {isLastBeat ? 'Begin' : 'Continue'}
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SceneWrapper>
    )
  }

  // Main game screen
  const netIncome = getMonthlyNetIncome()
  const isTimeFlowing = flowMode !== 'paused'

  // Determine pressure class
  const pressureClass = deadlinePressure > 80 ? 'deadline-pressure-high' :
                        deadlinePressure > 50 ? 'deadline-pressure-medium' :
                        deadlinePressure > 20 ? 'deadline-pressure-low' : ''

  return (
    <SceneWrapper
      type={currentEvent ? sceneType : 'neutral'}
      className={cn('min-h-screen', characterClass, isCurrentEventSystem && 'mode-system')}
      showVignette={currentEvent?.interruptPriority === 'critical'}
      intensity={currentEvent?.interruptPriority === 'critical' ? 'heavy' : 'light'}
    >
      {/* Top Header Bar */}
      <header className={cn(
        'border-b border-border bg-card/95 backdrop-blur-sm px-4 py-3 sticky top-0 z-40',
        isTimeFlowing && 'time-flowing'
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-serif font-bold text-lg">Pending</h1>
            <div className="h-4 w-px bg-border" />
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
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
          <Card className={cn('character-accent-border', pressureClass)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                {currentProfile?.name}
              </CardTitle>
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
                  <div className={cn(
                    'text-xs flex items-center gap-1 p-2 rounded',
                    deadlinePressure > 50 ? 'bg-danger/10 text-danger animate-pulse-urgent' : 'text-warning'
                  )}>
                    <AlertTriangle className="h-3 w-3" />
                    Expires {status.expirationDate.month}/{status.expirationDate.year}
                  </div>
                )}
              </div>

              {/* Work/Travel Authorization */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={cn(
                  'flex items-center gap-1 p-1.5 rounded',
                  status?.workAuthorized ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                )}>
                  <Briefcase className="h-3 w-3" />
                  {status?.workAuthorized ? 'Can Work' : 'No Work Auth'}
                </div>
                <div className={cn(
                  'flex items-center gap-1 p-1.5 rounded',
                  status?.canTravel ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                )}>
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
                <span className={cn(
                  'font-medium',
                  bankBalance < 500 && 'text-danger'
                )}>
                  {formatCurrency(bankBalance)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Monthly Net</span>
                <span className={cn(
                  'font-medium',
                  netIncome >= 0 ? 'text-success' : 'text-danger'
                )}>
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
            showingOutcome && lastOutcomeText ? (
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle>{currentEvent.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={cn(
                    'p-4 rounded-md border-l-4 animate-slide-up',
                    isCurrentEventSystem ? 'bg-system-muted border-system-accent' : 'bg-life-muted border-life-accent'
                  )}>
                    <p className="text-sm">{lastOutcomeText}</p>
                  </div>
                  <Button
                    onClick={() => {
                      hideOutcome()
                      clearCurrentEvent()
                    }}
                    className="w-full"
                  >
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <DecisionCard
                title={currentEvent.title}
                description={currentEvent.description}
                choices={currentEvent.choices}
                onChoiceSelect={(choiceId) => handleChoiceSelection(currentEvent.id, choiceId)}
                canAfford={canAffordChoice}
                isHeavyDecision={currentEvent.interruptPriority === 'critical' || currentEvent.interruptPriority === 'important'}
                showStakes={true}
                className="animate-fade-in"
              />
            )
          ) : (
            <Card className={cn(showMonthSummary && 'quiet-period')}>
              <CardContent className="py-8 text-center">
                {showMonthSummary ? (
                  <div className="time-skip-text space-y-3">
                    <Clock className="h-8 w-8 mx-auto text-muted-foreground/50 animate-pulse-slow" />
                    <p className="text-lg text-muted-foreground">Time passes...</p>
                    <p className="text-xl font-serif">{getFormattedDate()}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="quiet-period-text text-lg">
                      {isTimeFlowing
                        ? 'The days pass by...'
                        : 'The days pass quietly. Work, home, waiting.'}
                    </p>
                    {isTimeFlowing ? (
                      <div className="flex justify-center">
                        <LoadingSpinner className="opacity-50" />
                      </div>
                    ) : (
                      <div className="flex justify-center gap-3">
                        <Button onClick={() => resume()} size="lg">
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
                      <Button variant="ghost" size="sm" onClick={() => pause()}>
                        <Pause className="mr-2 h-4 w-4" />
                        Pause
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Pending Applications */}
          <Card className={cn(isCurrentEventSystem && 'mode-system')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Pending Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeApplications.length > 0 ? (
                <div className="space-y-2">
                  {activeApplications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                      <span className="font-mono text-xs">{app.formId.toUpperCase()}</span>
                      <Badge variant="outline" className="stamp-pending text-xs">
                        Pending
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No pending applications.
                </p>
              )}
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
                  <span className="text-xs text-muted-foreground capitalize px-2 py-0.5 bg-muted rounded">
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
                <span className={cn(totalImmigrationSpending > 0 && 'text-warning')}>
                  {formatCurrency(totalImmigrationSpending)}
                </span>
              </div>
              {deadlinePressure > 0 && (
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="text-muted-foreground">Deadline Pressure</span>
                  <span className={cn(
                    deadlinePressure > 80 ? 'text-danger font-bold' :
                    deadlinePressure > 50 ? 'text-warning' : 'text-muted-foreground'
                  )}>
                    {Math.round(deadlinePressure)}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Pause Menu Overlay */}
      {isGamePaused && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
          <Card className="w-full max-w-sm shadow-modal">
            <CardHeader>
              <CardTitle className="text-center">Paused</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={() => setPaused(false)}>
                <Play className="mr-2 h-4 w-4" />
                Resume
              </Button>
              <Button variant="outline" className="w-full" disabled>
                Save Game
              </Button>
              <Button variant="outline" className="w-full" disabled>
                Settings
              </Button>
              <div className="pt-2 border-t border-border">
                <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => {
                  setPaused(false)
                  useGameStore.getState().setScreen('title')
                }}>
                  Main Menu
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </SceneWrapper>
  )
}
