import { createContext, useContext } from 'react'

/*
  TRUE INSIDE THE APP SWITCHER'S CARDS. A card is a live render of the app, so
  without this every card would count as the business being opened again; the
  switcher wraps its previews in it and tracking stays quiet there.
*/
export const InPreview = createContext(false)
export const useInPreview = () => useContext(InPreview)
