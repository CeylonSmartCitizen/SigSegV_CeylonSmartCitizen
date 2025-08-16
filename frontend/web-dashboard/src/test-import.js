// Simple test to verify AuthContext imports work
console.log('Testing AuthContext imports...')

try {
  import('./contexts/AuthContext.jsx').then(module => {
    console.log('Module imported successfully:', Object.keys(module))
    console.log('useAuth available:', typeof module.useAuth)
    console.log('AuthProvider available:', typeof module.AuthProvider)
  }).catch(error => {
    console.error('Import failed:', error)
  })
} catch (error) {
  console.error('Import error:', error)
}
