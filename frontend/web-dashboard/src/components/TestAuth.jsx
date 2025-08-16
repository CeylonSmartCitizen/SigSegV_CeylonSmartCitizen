// Test file to verify AuthContext exports
import { useAuth, AuthProvider } from '../contexts/AuthContext'

console.log('useAuth:', useAuth)
console.log('AuthProvider:', AuthProvider)

export default function TestAuth() {
  return <div>Test Auth Component</div>
}
