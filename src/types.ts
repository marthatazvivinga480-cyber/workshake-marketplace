export type ServiceCategory = {
  slug: string
  name: string
  short: string
  description: string
  icon: string
  popularTasks: string[]
}

export type Provider = {
  id: string

  // Firestore provider identity
  userId?: string

  // Public provider information
  name: string
  initials: string
  category: string
  categorySlug?: string
  location: string
  experience?: string
  bio: string

  // Trust and marketplace activity
  verified: boolean
  rating: number
  reviews: number
  jobs: number

  // Optional profile information
  skills?: string[]
  responseTime?: string
  startingPrice?: number
}

export type Job = {
  id: string
  title: string
  category: string
  location: string
  budget: string
  posted: string
  urgency: 'Today' | 'This week' | 'Flexible'
  description: string
  status: 'Open' | 'In progress' | 'Completed'
}