import { useGameStore } from '@/stores/useGameStore'
import { TitleScreen } from '@/components/screens/TitleScreen'
import { CharacterSelect } from '@/components/screens/CharacterSelect'
import { GameScreen } from '@/components/screens/GameScreen'
import { EndingScreen } from '@/components/screens/EndingScreen'

export function AppRouter() {
  const currentScreen = useGameStore((state) => state.currentScreen)

  return (
    <div className="min-h-screen bg-background">
      {currentScreen === 'title' && <TitleScreen />}
      {currentScreen === 'content-warning' && <TitleScreen />}
      {currentScreen === 'character-select' && <CharacterSelect />}
      {currentScreen === 'opening' && <GameScreen />}
      {currentScreen === 'game' && <GameScreen />}
      {currentScreen === 'ending' && <EndingScreen />}
    </div>
  )
}
