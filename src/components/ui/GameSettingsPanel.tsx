import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, Accessibility, Type, SlidersHorizontal } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './Dialog'
import { Button } from './Button'
import { useSettingsStore } from '@/stores'

interface GameSettingsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GameSettingsPanel({ open, onOpenChange }: GameSettingsPanelProps) {
  const { t, i18n } = useTranslation('ui')
  const {
    language,
    motionIntensity,
    contentIntensity,
    subtitleSpeed,
    fontScale,
    setLanguage,
    setMotionIntensity,
    setContentIntensity,
    setSubtitleSpeed,
    setFontScale,
  } = useSettingsStore()

  useEffect(() => {
    i18n.changeLanguage(language)
  }, [language, i18n])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('settings.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <section className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t('settings.language')}
            </h4>
            <div className="flex gap-2">
              <Button variant={language === 'en' ? 'default' : 'outline'} size="sm" onClick={() => setLanguage('en')}>
                {t('settings.english')}
              </Button>
              <Button variant={language === 'es' ? 'default' : 'outline'} size="sm" onClick={() => setLanguage('es')}>
                {t('settings.spanish')}
              </Button>
            </div>
          </section>

          <section className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Accessibility className="h-4 w-4" />
              {t('settings.motion')}
            </h4>
            <div className="flex gap-2">
              <Button
                variant={motionIntensity === 'full' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMotionIntensity('full')}
              >
                {t('settings.full')}
              </Button>
              <Button
                variant={motionIntensity === 'reduced' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMotionIntensity('reduced')}
              >
                {t('settings.reduced')}
              </Button>
            </div>
          </section>

          <section className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              {t('settings.content')}
            </h4>
            <div className="flex gap-2">
              <Button
                variant={contentIntensity === 'full' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setContentIntensity('full')}
              >
                {t('settings.full')}
              </Button>
              <Button
                variant={contentIntensity === 'softened' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setContentIntensity('softened')}
              >
                {t('settings.softened')}
              </Button>
            </div>
          </section>

          <section className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Type className="h-4 w-4" />
              {t('settings.fontScale')}
            </h4>
            <div className="flex gap-2">
              <Button variant={fontScale === 'sm' ? 'default' : 'outline'} size="sm" onClick={() => setFontScale('sm')}>
                {t('settings.small')}
              </Button>
              <Button variant={fontScale === 'md' ? 'default' : 'outline'} size="sm" onClick={() => setFontScale('md')}>
                {t('settings.medium')}
              </Button>
              <Button variant={fontScale === 'lg' ? 'default' : 'outline'} size="sm" onClick={() => setFontScale('lg')}>
                {t('settings.large')}
              </Button>
            </div>
          </section>

          <section className="space-y-2">
            <label htmlFor="subtitle-speed" className="text-sm font-medium">
              {t('settings.subtitleSpeed')}: {subtitleSpeed.toFixed(1)}x
            </label>
            <input
              id="subtitle-speed"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={subtitleSpeed}
              onChange={(event) => setSubtitleSpeed(Number(event.target.value))}
              className="w-full"
            />
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
