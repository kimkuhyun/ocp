import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // 도커 외부 접속 허용
    port: 5173,
    watch: {
      usePolling: true // 윈도우 파일 변경 감지
    }
  }
})