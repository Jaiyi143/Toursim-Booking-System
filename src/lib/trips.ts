export type Trip = {
  slug: string
  destination: string
  province: string
  title: string
  category: string
  image: string
  alt: string
  duration: string
  description: string
  highlights: readonly string[]
}

export const photos = import.meta.env.BASE_URL + 'images/travel/'

export const sampleTrips: readonly Trip[] = [
  {
    slug: 'el-nido-lagoon-days',
    destination: 'El Nido',
    province: 'Palawan',
    title: 'El Nido Lagoon Days',
    category: 'Island hopping',
    image: 'el-nido.jpg',
    alt: 'Turquoise water winding between the limestone walls of Big Lagoon',
    duration: '3 days',
    description: 'Paddle through limestone lagoons and spend an afternoon on the beaches of Bacuit Bay.',
    highlights: ['Kayak in Big Lagoon', 'Snorkel in Bacuit Bay', 'Take a beach break between island stops'],
  },
  {
    slug: 'hills-of-bohol',
    destination: 'Bohol',
    province: 'Central Visayas',
    title: 'Hills of Bohol',
    category: 'Countryside',
    image: 'bohol.jpg',
    alt: 'Rounded Chocolate Hills stretching across the Bohol countryside',
    duration: '2 days',
    description: 'Take in the Chocolate Hills, follow the Loboc River, and make time for a countryside stop.',
    highlights: ['Visit the Chocolate Hills viewpoint', 'Stop by the Loboc River', 'Explore the Bohol countryside'],
  },
  {
    slug: 'slow-days-in-siargao',
    destination: 'Siargao',
    province: 'Surigao del Norte',
    title: 'Slow Days in Siargao',
    category: 'Island escape',
    image: 'siargao.jpg',
    alt: 'A wide canopy of coconut palms on Siargao Island',
    duration: '4 days',
    description: 'Spend a few unhurried days among coconut groves, tidal pools, and the shores of General Luna.',
    highlights: ['Look out over the coconut groves', 'Visit the Magpupungko tidal pools when tides allow', 'Spend a free afternoon in General Luna'],
  },
]
