import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './fonts.css'
import './styles.css'

/*
  /kitchen is the counter's screen, not the customer's app.

  Chosen here, before App mounts, so a kitchen tablet never plays the landing
  takeover or loads the catalogue, and a customer never downloads the kitchen
  board. The server already answers every non-API path with index.html.
*/
const KitchenScreen = lazy(() => import('./apps/KitchenScreen'))
const isKitchen = /^\/kitchen\/?$/.test(window.location.pathname)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isKitchen ? (
      <Suspense fallback={<div className="kitchen-screen" />}>
        <KitchenScreen />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
)
