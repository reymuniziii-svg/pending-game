import { useGameStore, useTimeStore, useCharacterStore, useFinanceStore, useFormStore } from '@/stores'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { formatCurrency, getStatusDisplayName } from '@/lib/utils'
import { PROFILES } from './CharacterSelect'
import { RotateCcw, Share2, ExternalLink } from 'lucide-react'

export function EndingScreen() {
  const { selectedCharacterId, resetGame, setScreen, playTimeMinutes } = useGameStore()
  const { currentYear, totalMonthsElapsed } = useTimeStore()
  const { status, statusHistory, profile } = useCharacterStore()
  const { totalImmigrationSpending, totalRemittancesSent, peakBalance, lowestBalance } = useFinanceStore()
  const { approvedApplications, deniedApplications } = useFormStore()

  const currentProfile = PROFILES.find(p => p.id === selectedCharacterId) || profile

  const yearsInUS = Math.floor(totalMonthsElapsed / 12) + ((currentProfile?.initialAge || 0) - (currentProfile?.arrivalAge || 0))

  const handlePlayAgain = () => {
    resetGame()
    setScreen('character-select')
  }

  const handleMainMenu = () => {
    resetGame()
    setScreen('title')
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Ending Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2">
            {currentProfile?.name}'s Story
          </h1>
          <p className="text-xl text-muted-foreground">
            {currentYear}
          </p>
        </div>

        {/* Final Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Final Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <p className="text-3xl font-serif font-bold mb-2">
                {getStatusDisplayName(status?.type || 'undocumented')}
              </p>
              <p className="text-muted-foreground">
                After {yearsInUS} years in the United States
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>The Numbers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Stat label="Years in US" value={yearsInUS.toString()} />
              <Stat label="Status Changes" value={statusHistory.length.toString()} />
              <Stat label="Applications Filed" value={(approvedApplications.length + deniedApplications.length).toString()} />
              <Stat label="Applications Approved" value={approvedApplications.length.toString()} />
              <Stat label="Applications Denied" value={deniedApplications.length.toString()} />
              <Stat label="Immigration Costs" value={formatCurrency(totalImmigrationSpending)} />
              <Stat label="Remittances Sent" value={formatCurrency(totalRemittancesSent)} />
              <Stat label="Peak Savings" value={formatCurrency(peakBalance)} />
              <Stat label="Lowest Balance" value={formatCurrency(lowestBalance)} />
            </div>
          </CardContent>
        </Card>

        {/* Reflection */}
        <Card className="mb-6">
          <CardContent className="py-6">
            <blockquote className="text-center">
              <p className="text-lg italic text-foreground/80 mb-4">
                "{currentProfile?.idealAmericaQuote}"
              </p>
              <footer className="text-sm text-muted-foreground">
                — {currentProfile?.name}, at the beginning
              </footer>
            </blockquote>
          </CardContent>
        </Card>

        {/* Play Time */}
        <p className="text-center text-sm text-muted-foreground mb-8">
          Play time: {Math.round(playTimeMinutes)} minutes
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handlePlayAgain}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Play Another Story
          </Button>
          <Button variant="outline" disabled>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" onClick={handleMainMenu}>
            Main Menu
          </Button>
        </div>

        {/* Resources */}
        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground mb-4">
            The experiences depicted in this game are based on real immigration policies and documented stories.
          </p>
          <a
            href="https://www.nilc.org/get-involved/community-education-resources/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-accent hover:underline text-sm"
          >
            <ExternalLink className="h-4 w-4" />
            Immigration resources and support
          </a>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-3 bg-muted/30 rounded-md">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
