import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from '@/app/App'
import { initializeTheme } from '@/app/theme'

const initialTheme = initializeTheme()

async function enableMocking() {
  if (
    !import.meta.env.DEV ||
    import.meta.env.VITE_USE_MOCK_API !== 'true'
  ) {
    return
  }

  const { worker } = await import('@/shared/mocks/browser')

  await worker.start({
    onUnhandledRequest: 'bypass',
  })
}

async function bootstrap() {
  await enableMocking()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App initialTheme={initialTheme} />
    </StrictMode>,
  )
}

void bootstrap()
