import { useState } from 'react'
import { useGameStore } from '@/stores'
import { useSaveStore } from '@/stores/useSaveStore'
import { Button, GameSettingsPanel } from '@/components/ui'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui'
import { AlertTriangle, ExternalLink, Settings } from 'lucide-react'

export function TitleScreen() {
  const { t } = useTranslation('ui')
  const { setScreen, acknowledgeContentWarning, hasSeenContentWarning } = useGameStore()
  const [showWarning, setShowWarning] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [hasSave] = useState(() => useSaveStore.getState().hasSaveInSlot(0))

  const handleBegin = () => {
    if (hasSeenContentWarning) {
      setScreen('character-select')
    } else {
      setShowWarning(true)
    }
  }

  const handleAcknowledge = () => {
    setShowWarning(false)
    acknowledgeContentWarning()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      {/* Main Title */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-6xl md:text-7xl font-serif font-bold text-primary mb-4 tracking-tight">
          {t('app.title')}
        </h1>
        <p className="text-xl md:text-2xl text-foreground/80 font-serif italic mb-2">
          {t('app.subtitle')}
        </p>
        <div className="w-24 h-px bg-border mx-auto my-8" />
        <p className="text-base text-muted-foreground max-w-md mx-auto mb-12">
          {t('title.tagline')}
        </p>

        <div className="flex flex-col gap-4 items-center">
          <Button
            size="xl"
            onClick={handleBegin}
            className="min-w-[200px]"
          >
            {t('title.begin')}
          </Button>

          <div className="flex gap-4 mt-4">
            {hasSave && (
              <Button variant="ghost" size="sm" onClick={() => useSaveStore.getState().loadGame(0)}>
                Continue
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setShowAbout(true)}>
              {t('title.about')}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-center text-sm text-muted-foreground">
        <p>All facts depicted are documented realities.</p>
      </div>

      {/* About Dialog */}
      <Dialog open={showAbout} onOpenChange={setShowAbout}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>About Pending</DialogTitle>
            <DialogDescription>
              An educational immigration life-simulation game.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-sm text-foreground/80">
            <p>
              <em>Pending</em> follows four characters — Maria, David, Elena, and Fatima — navigating
              the U.S. immigration system month by month. Every event, form, trap, and deadline is
              based on real policy and documented experience.
            </p>
            <p>
              The game is intended to be educational, not to trivialize the experiences it depicts.
            </p>
            <p className="text-muted-foreground text-xs pt-2 border-t border-border">
              Built with care. All facts are documented realities. Nothing is exaggerated.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowAbout(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Panel */}
      <GameSettingsPanel open={showSettings} onOpenChange={setShowSettings} />

      {/* Content Warning Dialog */}
      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 text-warning mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-wide">{t('title.contentNotice')}</span>
            </div>
            <DialogTitle className="text-xl">{t('title.beforeYouBegin')}</DialogTitle>
            <DialogDescription className="text-base leading-relaxed mt-4">
              This game depicts real experiences of immigrants navigating the US immigration system.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="text-sm text-foreground/80 space-y-2">
              <p className="font-medium">Content includes:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>Family separation and loss</li>
                <li>Economic hardship and exploitation</li>
                <li>Discrimination and prejudice</li>
                <li>Bureaucratic frustration and injustice</li>
                <li>Trauma and mental health struggles</li>
                <li>References to violence and death</li>
              </ul>
            </div>

            <div className="bg-muted/50 rounded-md p-4 text-sm">
              <p className="text-foreground/80">
                All events in this game are based on documented experiences. Nothing is exaggerated.
                The system speaks for itself.
              </p>
            </div>

            <a
              href="https://www.nilc.org/get-involved/community-education-resources/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-accent hover:underline text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              Immigration resources and support
            </a>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWarning(false)}>
              {t('title.goBack')}
            </Button>
            <Button onClick={handleAcknowledge}>
              {t('title.understand')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
