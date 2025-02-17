import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'

const sqlRawPlugin = {
  name: 'sql-raw',
  transform(code, id) {
    if (id.endsWith('.sql')) {
      const sqlContent = readFileSync(id, 'utf-8')
      return {
        code: `export default ${JSON.stringify(sqlContent)};`,
        map: null
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), sqlRawPlugin],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
