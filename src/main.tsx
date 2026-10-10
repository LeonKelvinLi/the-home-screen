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

/* /crm, the team's growth screen, is chosen the same way and for the same
   reasons: no customer ever downloads it, and it never plays the landing. */
const CrmScreen = lazy(() => import('./crm/CrmScreen'))
const isCrm = /^\/crm\/?$/.test(window.location.pathname)

/* /join, the affiliate onboarding portal (src/join), chosen the same way: an
   affiliate opening their invite link never downloads the phone UI. */
const JoinScreen = lazy(() => import('./join/JoinScreen'))
const isJoin = /^\/join(\/[A-Za-z0-9_-]{20,80})?\/?$/.test(window.location.pathname)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isKitchen ? (
      <Suspense fallback={<div className="kitchen-screen" />}>
        <KitchenScreen />
      </Suspense>
    ) : isCrm ? (
      <Suspense fallback={<div className="crm" />}>
        <CrmScreen />
      </Suspense>
    ) : isJoin ? (
      <Suspense fallback={<div className="onb" />}>
        <JoinScreen />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
)
