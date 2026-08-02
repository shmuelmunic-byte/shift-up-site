import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// פרוקסי מקומי כדי ש-/sb יעבוד גם ב-dev וגם ב-preview, בדיוק כמו בפרודקשן
// (vercel.json / netlify.toml). כך הקוד זהה בכל הסביבות.
const sbProxy = {
  '/sb': {
    target: 'https://fsqstwlapiiqbnyjjzqx.supabase.co',
    changeOrigin: true,
    secure: true,
    rewrite: (p) => p.replace(/^\/sb/, ''),
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { proxy: sbProxy },
  preview: { proxy: sbProxy },
})
