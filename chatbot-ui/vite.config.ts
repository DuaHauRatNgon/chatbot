// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import { fileURLToPath } from 'url'
// import { dirname, resolve } from 'path'
// import checker from 'vite-plugin-checker'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = dirname(__filename)

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react(), checker({ typescript: false }) ],
//   server: {
//     port: 8501,
//     watch: {
//       usePolling: false,
//       interval: 1000
//     }
//   },
//   resolve: {
//     alias: {
//       '@': resolve(__dirname, './src')
//     }
//   }
// })
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8501,
    watch: {
      usePolling: false,
      interval: 1000
    },
    allowedHosts: ['minds.edu.vn', 'api.minds.edu.vn', 'admin.minds.edu.vn']

  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})

