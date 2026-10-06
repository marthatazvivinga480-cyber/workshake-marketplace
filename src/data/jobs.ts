import type { Job } from '../types'

export const jobs: Job[] = [
  { id: 'leaking-kitchen-tap', title: 'Kitchen tap leaking badly', category: 'Plumbing', location: 'Avondale, Harare', budget: '$20–$35', posted: '8 min ago', urgency: 'Today', description: 'The tap keeps dripping and the base is now leaking onto the counter. I need someone who can inspect it and replace parts if needed.', status: 'Open' },
  { id: 'wall-mount-tv', title: 'Mount a 55-inch TV', category: 'Home repairs', location: 'Borrowdale, Harare', budget: '$25–$40', posted: '24 min ago', urgency: 'This week', description: 'Bracket is already available. Need safe wall mounting, cable routing and final level check.', status: 'Open' },
  { id: 'laptop-overheating', title: 'Laptop overheats and shuts down', category: 'Tech repair', location: 'CBD, Harare', budget: '$20–$45', posted: '41 min ago', urgency: 'Today', description: 'Laptop runs for around 20 minutes before overheating. Looking for diagnostics, cleaning and thermal-paste replacement if necessary.', status: 'Open' },
  { id: 'garden-cleanup', title: 'Weekend garden cleanup', category: 'Garden & outdoors', location: 'Greendale, Harare', budget: '$35–$55', posted: '1 hr ago', urgency: 'This week', description: 'Need grass cut, edges cleaned, leaves removed and two hedges trimmed.', status: 'Open' },
  { id: 'move-sofa', title: 'Move a sofa across town', category: 'Moving help', location: 'Highlands → Milton Park', budget: '$25–$40', posted: '2 hrs ago', urgency: 'Flexible', description: 'One three-seater sofa. Ground floor pickup and ground floor delivery.', status: 'Open' },
]
