import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthGuard } from './components/AuthGuard'
import { Layout } from './components/Layout'
import { useAuth } from './context/AuthContext'

const HomePage = lazy(() => import('./pages/HomePage'))
const FindHelpPage = lazy(() => import('./pages/FindHelpPage'))
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const PostProblemPage = lazy(() => import('./pages/PostProblemPage'))
const ProvidersPage = lazy(() => import('./pages/ProvidersPage'))
const ProviderDetailPage = lazy(() => import('./pages/ProviderDetailPage'))
const JobDetailPage = lazy(() => import('./pages/JobDetailPage'))
const MessagesPage = lazy(() => import('./pages/MessagesPage'))
const BookingsPage = lazy(() => import('./pages/BookingsPage'))
const BecomeProviderPage = lazy(() => import('./pages/BecomeProviderPage'))
const SignInPage = lazy(() => import('./pages/SignInPage'))
const SignUpPage = lazy(() => import('./pages/SignUpPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const CustomerDashboardPage = lazy(
  () => import('./pages/CustomerDashboardPage'),
)
const ProviderDashboardPage = lazy(
  () => import('./pages/ProviderDashboardPage'),
)
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const BookProviderPage = lazy(() => import('./pages/BookProviderPage'))
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const FAQPage = lazy(() => import('./pages/FAQPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const protectedPage = (node: ReactNode) => (
  <AuthGuard>{node}</AuthGuard>
)

function DashboardRouter() {
  const { profile, ready } = useAuth()

  if (!ready) {
    return (
      <div className="page-shell">
        <div className="skeleton h-40 rounded-[2rem]" />
      </div>
    )
  }

  if (profile?.role === 'provider') {
    return <ProviderDashboardPage />
  }

  return <CustomerDashboardPage />
}

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="page-shell">
          <div className="skeleton h-40 rounded-[2rem]" />
        </div>
      }
    >
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />

          <Route path="find-help" element={<FindHelpPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="category/:slug" element={<CategoryPage />} />

          <Route path="post-problem" element={<PostProblemPage />} />

          <Route path="providers" element={<ProvidersPage />} />
          <Route path="provider/:id" element={<ProviderDetailPage />} />

          <Route path="job/:id" element={<JobDetailPage />} />

          <Route
            path="messages"
            element={protectedPage(<MessagesPage />)}
          />

          <Route
            path="bookings"
            element={protectedPage(<BookingsPage />)}
          />

          <Route
            path="become-a-provider"
            element={<BecomeProviderPage />}
          />

          <Route path="sign-in" element={<SignInPage />} />
          <Route path="sign-up" element={<SignUpPage />} />

          <Route
            path="forgot-password"
            element={<ForgotPasswordPage />}
          />

          <Route
            path="dashboard"
            element={protectedPage(<DashboardRouter />)}
          />

          <Route
            path="provider-dashboard"
            element={
              protectedPage(
                <Navigate to="/dashboard" replace />,
              )
            }
          />

          <Route
            path="profile"
            element={protectedPage(<ProfilePage />)}
          />

          <Route
            path="book/:providerId"
            element={protectedPage(<BookProviderPage />)}
          />

          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="privacy" element={<PrivacyPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}