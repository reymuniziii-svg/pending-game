import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AppRouter } from './app/AppRouter'
import { ErrorBoundary } from './app/ErrorBoundary'
import { loadContentBundle } from './content'
import { useSettingsStore, useSimulationStore } from './stores'

function App() {
  const { i18n, t } = useTranslation('ui')
  const language = useSettingsStore((state) => state.language)
  const fontScale = useSettingsStore((state) => state.fontScale)
  const setBundleVersion = useSimulationStore((state) => state.setBundleVersion)

  useEffect(() => {
    void i18n.changeLanguage(language)
    localStorage.setItem('pending_locale', language)
  }, [i18n, language])

  useEffect(() => {
    void loadContentBundle({ locale: language }).then((bundle) => {
      setBundleVersion(bundle.version)
    })
  }, [language, setBundleVersion])

  const fontScaleClass = fontScale === 'sm'
    ? 'text-sm'
    : fontScale === 'lg'
      ? 'text-lg'
      : 'text-base'

  return (
    <ErrorBoundary>
      <div className={`min-h-screen bg-background ${fontScaleClass}`}>
        <AppRouter />
        <div className="fixed bottom-2 right-3 text-[10px] text-muted-foreground/70 pointer-events-none">
          {t('app.nonLegalDisclaimer')}
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default App
