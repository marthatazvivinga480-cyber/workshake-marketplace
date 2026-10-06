import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, firebaseConfigured } from '../lib/firebase'

type UserRole = 'customer' | 'provider'

type UserProfile = {
  name?: string
  email?: string
  role: UserRole
}

type AuthContextValue = {
  user: User | null
  profile: UserProfile | null
  ready: boolean
  configured: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [ready, setReady] = useState(!auth)

  useEffect(() => {
    if (!auth) return

    return onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser)
      setProfile(null)

      if (!nextUser) {
        setReady(true)
        return
      }

      if (!db) {
        setReady(true)
        return
      }

      try {
        const profileRef = doc(db, 'users', nextUser.uid)
        const snapshot = await getDoc(profileRef)

        if (snapshot.exists()) {
          const data = snapshot.data()

          setProfile({
            name: typeof data.name === 'string' ? data.name : undefined,
            email: typeof data.email === 'string' ? data.email : undefined,
            role: data.role === 'provider' ? 'provider' : 'customer',
          })
        } else {
          setProfile({
            name: nextUser.displayName ?? undefined,
            email: nextUser.email ?? undefined,
            role: 'customer',
          })
        }
      } catch (error) {
        console.error('Could not load user profile:', error)

        setProfile({
          name: nextUser.displayName ?? undefined,
          email: nextUser.email ?? undefined,
          role: 'customer',
        })
      } finally {
        setReady(true)
      }
    })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      ready,
      configured: firebaseConfigured,
      signOut: async () => {
        if (auth) {
          await firebaseSignOut(auth)
        }

        setProfile(null)
      },
    }),
    [profile, ready, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)

  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return value
}