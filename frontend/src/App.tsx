import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/UI/Sidebar'
import { StatusBar } from './components/UI/StatusBar'
import REPLInterface from './components/REPL/REPLInterface'
import { GoogleAuth } from './components/UI/GoogleAuth'
import { useAuthStore } from './stores/authStore'
import { useTheme } from './hooks/useTheme'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  const { isAuthenticated, isLoading } = useAuthStore()
  const { theme } = useTheme()

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gemini-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Initializing Gemini CLI...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="h-screen bg-gradient-to-br from-gemini-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <GoogleAuth />
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
          {/* Main Layout */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <Sidebar />
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              <Routes>
                <Route path="/" element={<REPLInterface />} />
              </Routes>
            </div>
          </div>
          
          {/* Status Bar */}
          <StatusBar />
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App
