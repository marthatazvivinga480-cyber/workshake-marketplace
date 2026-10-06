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
  name: string
  initials: string
  category: string
  location: string
  rating: number
  reviews: number
  jobs: number
  responseTime: string
  verified: boolean
  bio: string
  skills: string[]
  startingPrice: number
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
