import { useState } from 'react'
import { useGameStore, useCharacterStore, useTimeStore, useFinanceStore, useRelationshipStore } from '@/stores'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CharacterPortrait } from '@/components/ui'
import { ArrowLeft, Briefcase, MapPin } from 'lucide-react'
import type { CharacterProfile } from '@/types'
import { useTranslation } from 'react-i18next'
import { CHARACTER_PROFILES as PROFILES } from '@/data/characters'


export function CharacterSelect() {
  const { t } = useTranslation('ui')
  const { setScreen, startNewGame } = useGameStore()
  const { initializeCharacter } = useCharacterStore()
  const { initializeTime } = useTimeStore()
  const { initialize: initializeFinance } = useFinanceStore()
  const { initialize: initializeRelationships } = useRelationshipStore()

  const [selectedProfile, setSelectedProfile] = useState<CharacterProfile | null>(null)

  const handleSelectProfile = (profile: CharacterProfile) => {
    setSelectedProfile(profile)
  }

  const handleStartGame = () => {
    if (!selectedProfile) return

    // Initialize time
    initializeTime(1, 1, selectedProfile.gameStartYear)

    // Initialize character
    initializeCharacter(selectedProfile, { day: 1, month: 1, year: selectedProfile.gameStartYear })

    // Initialize finance
    initializeFinance(
      selectedProfile.initialFinances.bankBalance,
      selectedProfile.initialFinances.monthlyIncome,
      [
        { id: 'housing', name: 'Housing', amount: selectedProfile.initialFinances.monthlyExpenses * 0.4, category: 'housing', isRequired: true, canReduce: false },
        { id: 'food', name: 'Food & Essentials', amount: selectedProfile.initialFinances.monthlyExpenses * 0.25, category: 'food', isRequired: true, canReduce: true, minimumAmount: 200 },
        { id: 'transport', name: 'Transportation', amount: selectedProfile.initialFinances.monthlyExpenses * 0.15, category: 'transport', isRequired: true, canReduce: true, minimumAmount: 50 },
        { id: 'other', name: 'Other', amount: selectedProfile.initialFinances.monthlyExpenses * 0.2, category: 'other', isRequired: false, canReduce: true },
      ],
      selectedProfile.initialFinances.debt
    )

    // Initialize relationships
    initializeRelationships(selectedProfile.initialRelationships)

    // Start the game
    startNewGame(selectedProfile.id)
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => setScreen('title')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('characterSelect.back')}
          </Button>
          <div>
            <h1 className="text-3xl font-serif font-bold">{t('characterSelect.title')}</h1>
            <p className="text-muted-foreground">{t('characterSelect.subtitle')}</p>
          </div>
        </div>

        {/* Profile Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {PROFILES.map((profile) => (
            <Card
              key={profile.id}
              className={`cursor-pointer transition-all hover:shadow-card-hover ${
                selectedProfile?.id === profile.id ? 'ring-2 ring-accent' : ''
              }`}
              onClick={() => handleSelectProfile(profile)}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <CharacterPortrait characterId={profile.id} size="md" />
                  <div className="flex-1">
                    <CardTitle className="text-xl">{profile.name}</CardTitle>
                    <CardDescription className="mt-1">{profile.tagline}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.countryOfOrigin}</span>
                    <span className="text-border">|</span>
                    <span>Age {profile.age}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>{profile.initialStatus.replace(/-/g, ' ').toUpperCase()}</span>
                  </div>
                  <p className="text-foreground/80 line-clamp-2">
                    {profile.backstory.slice(0, 120)}...
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Profile Detail */}
        {selectedProfile && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{selectedProfile.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="narrative">{selectedProfile.backstory}</p>
              <blockquote className="border-l-4 border-accent pl-4 italic text-foreground/80">
                "{selectedProfile.idealAmericaQuote}"
              </blockquote>
              <div className="flex gap-4 pt-4">
                <Button size="lg" onClick={handleStartGame}>
                  {t('characterSelect.beginStory', { name: selectedProfile.name.split(' ')[0] })}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Export profiles for use elsewhere
export { PROFILES }
