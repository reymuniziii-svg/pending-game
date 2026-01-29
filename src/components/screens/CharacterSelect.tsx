import { useState } from 'react'
import { useGameStore, useCharacterStore, useTimeStore, useFinanceStore, useRelationshipStore } from '@/stores'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, CharacterPortrait } from '@/components/ui'
import { ArrowLeft, Briefcase, MapPin, Clock } from 'lucide-react'
import type { CharacterProfile } from '@/types'

// Character profiles for V1
const PROFILES: CharacterProfile[] = [
  {
    id: 'maria',
    name: 'Maria Santos',
    age: 28,
    countryOfOrigin: 'Mexico',
    countryCode: 'MX',
    nativeLanguage: 'Spanish',
    tagline: 'DACA recipient. Teacher. American in every way but one.',
    backstory: 'Brought to the US at age 6, Maria grew up as American as anyone. She graduated valedictorian, became a teacher, pays taxes, and has a retirement account. She speaks English natively. Her memories of Mexico are fragments. She is American in every meaningful sense except legal status.',
    motivations: ['This is her home', 'She knows nothing else', 'Her students need her'],
    idealAmericaQuote: 'I grew up saying the Pledge of Allegiance. I believed it. Liberty and justice for all. I\'m still waiting for the "all" to include me.',
    initialStatus: 'daca',
    initialAge: 28,
    arrivalAge: 6,
    gameStartYear: 2024,
    initialStats: { health: 85, stress: 35, englishProficiency: 98, communityConnection: 75 },
    initialFinances: { bankBalance: 3200, monthlyIncome: 4000, monthlyExpenses: 2800, debt: 12000, hasHealthInsurance: true },
    initialRelationships: [
      { id: 'miguel', name: 'Miguel', type: 'partner', citizenshipStatus: 'usc', location: 'with-player', level: 80, isSponsor: false, isPetitioner: false, isDependent: false, isDerivedFrom: false },
      { id: 'parents', name: 'Parents', type: 'parent', citizenshipStatus: 'undocumented', location: 'same-city', level: 90, isSponsor: false, isPetitioner: false, isDependent: false, isDerivedFrom: false },
    ],
    uniqueTraits: ['DACA recipient since 2012', 'Teacher of the Year nominee', 'Cannot travel abroad'],
    profileEventIds: ['maria_renewal', 'maria_policy', 'maria_wedding'],
    difficulty: 'standard',
    difficultyReason: 'Protected status but no path forward. Policy-dependent future.',
    openingBeats: [
      { id: 'maria_1', title: 'First Day', narrative: 'You remember your first day of American school. Six years old, not speaking a word of English, clutching your mother\'s hand.' },
      { id: 'maria_2', title: 'Growing Up', narrative: 'You learned English. Made friends. Became American. You didn\'t know you were different until high school, when everyone started talking about college applications and financial aid.' },
      { id: 'maria_3', title: 'The Truth', narrative: '"Mija, there\'s something we need to tell you." Your parents finally explained. No documents. No path. You were brought here. You had no choice.' },
      { id: 'maria_4', title: 'DACA', narrative: 'In 2012, a lifeline. DACA. Deferred Action for Childhood Arrivals. Work permit. Driver\'s license. A chance. You applied the day it opened.' },
      { id: 'maria_5', title: 'Teacher', narrative: 'Now you stand in front of your own classroom. Third grade. Twenty-two faces looking up at you. American kids. Just like you.' },
      { id: 'maria_6', title: 'The Renewal Notice', narrative: 'The letter arrives. Time to renew again. $495. The same ritual every two years. The same uncertainty.' },
      { id: 'maria_7', title: 'Your Hope', narrative: '"I just want to stop being temporary."' },
    ],
    possibleEndingIds: ['maria_citizen', 'maria_daca_forever', 'maria_undocumented', 'maria_deported'],
  },
  {
    id: 'david',
    name: 'David Sharma',
    age: 29,
    countryOfOrigin: 'India',
    countryCode: 'IN',
    nativeLanguage: 'Hindi',
    tagline: 'H-1B worker. Software engineer. 40-year backlog.',
    backstory: 'David graduated top of his class from IIT, earned a master\'s from a US university, and was recruited by a major tech company. He\'s talented, hardworking, playing by every rule. He was told America rewards merit.',
    motivations: ['Career opportunity', 'Professional ambition', 'Build a future'],
    idealAmericaQuote: 'In America, if you\'re talented and you work hard, you succeed. That\'s what everyone told me. That\'s why I came.',
    initialStatus: 'h1b-active',
    initialAge: 29,
    arrivalAge: 24,
    gameStartYear: 2024,
    initialStats: { health: 90, stress: 40, englishProficiency: 92, communityConnection: 45 },
    initialFinances: { bankBalance: 28000, monthlyIncome: 12000, monthlyExpenses: 4500, debt: 0, hasHealthInsurance: true },
    initialRelationships: [
      { id: 'priya', name: 'Priya', type: 'spouse', citizenshipStatus: 'visa-holder', location: 'with-player', level: 85, isSponsor: false, isPetitioner: false, isDependent: false, isDerivedFrom: true, occupation: 'Former engineer (H-4)' },
      { id: 'parents_india', name: 'Parents', type: 'parent', citizenshipStatus: 'abroad', location: 'abroad', level: 80, isSponsor: false, isPetitioner: false, isDependent: false, isDerivedFrom: false },
    ],
    uniqueTraits: ['Top tech company employee', 'EB-2 green card pending', 'India backlog: 40+ years'],
    profileEventIds: ['david_backlog', 'david_layoff', 'david_priya_career'],
    difficulty: 'challenging',
    difficultyReason: 'High income but golden handcuffs. Decades-long wait for green card.',
    openingBeats: [
      { id: 'david_1', title: 'IIT', narrative: 'Years of preparation. The entrance exam. One of the hardest in the world. You made it. Top of your class at IIT.' },
      { id: 'david_2', title: 'America', narrative: 'The acceptance letter from the American university. Your parents cried with joy. "America will see your talent. America will reward you."' },
      { id: 'david_3', title: 'The Offer', narrative: 'Campus recruitment. The tech company. The salary that seemed impossible. You won the H-1B lottery on your first try.' },
      { id: 'david_4', title: 'Priya', narrative: 'You married Priya. She was an engineer too. In India. Now she\'s on H-4. Waiting to see if she can work.' },
      { id: 'david_5', title: 'The Meeting', narrative: 'HR called you in to discuss green card sponsorship. They mentioned something about "the backlog." India category. EB-2.' },
      { id: 'david_6', title: 'The Number', narrative: 'You looked it up later. India EB-2 backlog. Forty years. Maybe more. You\'re 29.' },
      { id: 'david_7', title: 'Your Hope', narrative: '"They say it takes time, but I\'ve done everything right."' },
    ],
    possibleEndingIds: ['david_greencard', 'david_return', 'david_waiting', 'david_startup'],
  },
  {
    id: 'fatima',
    name: 'Fatima Haile',
    age: 29,
    countryOfOrigin: 'Eritrea',
    countryCode: 'ER',
    nativeLanguage: 'Tigrinya',
    tagline: 'Asylum seeker. Journalist. Survivor.',
    backstory: 'Fatima was a journalist in Eritrea. She wrote about government corruption. Colleagues disappeared. She received threats. She fled through Ethiopia, got a visa to Brazil, flew to Mexico, crossed to the US border, and presented herself requesting asylum.',
    motivations: ['Safety', 'Survival', 'Freedom to speak truth'],
    idealAmericaQuote: 'I was taught that America stands for freedom. That it protects journalists. That it doesn\'t send people back to be killed. I believed that. I still want to.',
    initialStatus: 'asylum-pending',
    initialAge: 29,
    arrivalAge: 28,
    gameStartYear: 2024,
    initialStats: { health: 70, stress: 65, englishProficiency: 65, communityConnection: 25 },
    initialFinances: { bankBalance: 400, monthlyIncome: 0, monthlyExpenses: 800, debt: 0, hasHealthInsurance: false },
    initialRelationships: [
      { id: 'cousin', name: 'Cousin Miriam', type: 'friend', citizenshipStatus: 'lpr', location: 'same-city', level: 60, isSponsor: false, isPetitioner: false, isDependent: false, isDerivedFrom: false },
      { id: 'family_eritrea', name: 'Family', type: 'parent', citizenshipStatus: 'abroad', location: 'abroad', level: 75, isSponsor: false, isPetitioner: false, isDependent: false, isDerivedFrom: false },
    ],
    uniqueTraits: ['Former journalist', 'Documented persecution', 'Cannot travel'],
    profileEventIds: ['fatima_ead', 'fatima_hearing', 'fatima_family_danger'],
    difficulty: 'brutal',
    difficultyReason: 'Years of waiting with no income. Trauma. Cannot leave or return.',
    openingBeats: [
      { id: 'fatima_1', title: 'The Article', narrative: 'You wrote about the disappearances. The corruption. The truth that everyone knew but no one said.' },
      { id: 'fatima_2', title: 'The Warning', narrative: 'Your colleague didn\'t come to work. Then another. Then the envelope under your door. "Stop writing or join them."' },
      { id: 'fatima_3', title: 'The Flight', narrative: 'You left with one bag. Through Ethiopia. A visa to Brazil. A flight to Mexico. Then north.' },
      { id: 'fatima_4', title: 'The Border', narrative: 'At the port of entry, you said the words: "I am requesting asylum in the United States." They took you to a room.' },
      { id: 'fatima_5', title: 'Processing', narrative: 'Days in detention. Interviews. Forms. Then release, to wait.' },
      { id: 'fatima_6', title: 'The Wait', narrative: 'They told you your hearing is scheduled. In four years. Maybe five. In the meantime, you cannot work. Not yet.' },
      { id: 'fatima_7', title: 'Your Hope', narrative: '"America protects people like me. That\'s what it means to be America."' },
    ],
    possibleEndingIds: ['fatima_asylum', 'fatima_denied', 'fatima_waiting', 'fatima_deported'],
  },
  {
    id: 'elena',
    name: 'Elena Morales',
    age: 32,
    countryOfOrigin: 'Mexico',
    countryCode: 'MX',
    nativeLanguage: 'Spanish',
    tagline: 'Married to a citizen. Mother of citizens. Still undocumented.',
    backstory: 'Elena crossed at 19 to work. She met Michael, a US citizen. They married, had two children who are citizens. She has been here 13 years. Her children know no other home. She is a mother, wife, community member. She has no status.',
    motivations: ['Her children', 'Her family', 'This is home now'],
    idealAmericaQuote: 'My husband is American. My children are American. I\'ve been here 13 years. I thought that would matter. I thought families mattered here.',
    initialStatus: 'undocumented',
    initialAge: 32,
    arrivalAge: 19,
    gameStartYear: 2024,
    initialStats: { health: 80, stress: 55, englishProficiency: 75, communityConnection: 70 },
    initialFinances: { bankBalance: 1800, monthlyIncome: 1800, monthlyExpenses: 1500, debt: 0, hasHealthInsurance: false },
    initialRelationships: [
      { id: 'michael', name: 'Michael', type: 'spouse', citizenshipStatus: 'usc', location: 'with-player', level: 75, isSponsor: true, isPetitioner: true, isDependent: false, isDerivedFrom: false, occupation: 'Warehouse supervisor' },
      { id: 'sofia', name: 'Sofia', type: 'child', citizenshipStatus: 'usc', location: 'with-player', level: 95, isSponsor: false, isPetitioner: false, isDependent: true, isDerivedFrom: false, age: 8 },
      { id: 'diego', name: 'Diego', type: 'child', citizenshipStatus: 'usc', location: 'with-player', level: 95, isSponsor: false, isPetitioner: false, isDependent: true, isDerivedFrom: false, age: 5 },
      { id: 'mother_mexico', name: 'Mother', type: 'parent', citizenshipStatus: 'abroad', location: 'abroad', level: 80, isSponsor: false, isPetitioner: false, isDependent: false, isDerivedFrom: false },
    ],
    uniqueTraits: ['Entered without inspection (EWI)', 'USC spouse and children', 'I-601A waiver needed'],
    profileEventIds: ['elena_lawyer', 'elena_waiver', 'elena_mother_sick'],
    difficulty: 'challenging',
    difficultyReason: 'Catch-22: Marriage to citizen doesn\'t help because she crossed the border.',
    openingBeats: [
      { id: 'elena_1', title: 'The Crossing', narrative: 'You were 19. There was no work at home. Everyone said America had opportunity. You crossed the desert in the dark.' },
      { id: 'elena_2', title: 'Working', narrative: 'Years of work. Cleaning houses. Sending money home. Building something.' },
      { id: 'elena_3', title: 'Michael', narrative: 'You met him at a friend\'s party. He didn\'t care about your status. "We\'ll figure it out," he said. "We\'re in love."' },
      { id: 'elena_4', title: 'The Wedding', narrative: 'A small ceremony. Your mother couldn\'t come. "Now you\'re safe," Michael said. "Now we can fix your papers."' },
      { id: 'elena_5', title: 'The Children', narrative: 'Sofia. Then Diego. American citizens. Your whole world.' },
      { id: 'elena_6', title: 'The Lawyer', narrative: '"You crossed without inspection," the lawyer explained. "Marriage to a citizen... it doesn\'t work the way you think. There\'s a catch."' },
      { id: 'elena_7', title: 'The Catch-22', narrative: 'To get a green card, you\'d have to leave the country. But if you leave, you\'re barred from coming back. Ten years. Maybe forever.' },
      { id: 'elena_8', title: 'Your Hope', narrative: '"There has to be a way. We\'re a family. This is America."' },
    ],
    possibleEndingIds: ['elena_waiver_approved', 'elena_waiver_denied', 'elena_undocumented', 'elena_deported'],
  },
]

export function CharacterSelect() {
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'standard': return 'success'
      case 'challenging': return 'warning'
      case 'brutal': return 'danger'
      default: return 'secondary'
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => setScreen('title')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-serif font-bold">Choose Your Story</h1>
            <p className="text-muted-foreground">Each path reveals different aspects of the system.</p>
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
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{profile.name}</CardTitle>
                        <CardDescription className="mt-1">{profile.tagline}</CardDescription>
                      </div>
                      <Badge variant={getDifficultyColor(profile.difficulty) as any}>
                        {profile.difficulty}
                      </Badge>
                    </div>
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
                    {profile.difficultyReason}
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
                  Begin {selectedProfile.name.split(' ')[0]}'s Story
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
