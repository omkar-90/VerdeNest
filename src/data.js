// Dummy business content — replace with real data later.
export const BRAND = {
  name: 'VerdeNest',
  phone: '+91 98765 43210',
  whatsapp: '919876543210',
  email: 'hello@verdenest.in',
  city: 'Nashik, Maharashtra',
}

export const CHAPTERS = [
  {
    id: 'structure',
    title: 'Engineered to stand 25+ years',
    text: 'Hot-dip galvanised steel arches, wind-tested to 150 km/h. Every frame is designed for your site, soil and crop.',
    specs: [
      ['150', 'km/h wind load'],
      ['25 yr', 'frame life'],
    ],
  },
  {
    id: 'covering',
    title: 'Light, filtered for growth',
    text: 'UV-stabilised poly film, toughened glass or shade net. Diffused light spreads evenly so leaves get light without burning.',
    specs: [
      ['89%', 'light transmission'],
      ['200µ', 'UV-stabilised film'],
    ],
  },
  {
    id: 'climate',
    title: 'Climate on autopilot',
    text: 'Exhaust fans, cooling pads and fogging keep temperature and humidity in range day and night, controlled from your phone.',
    specs: [
      ['−8°C', 'peak cooling'],
      ['24/7', 'IoT monitoring'],
    ],
  },
  {
    id: 'harvest',
    title: 'Harvest more, every season',
    text: 'Raised beds, drip fertigation and hydroponic NFT channels. Typical yields are 3–5× those of open-field farming.',
    specs: [
      ['5×', 'yield vs open field'],
      ['60%', 'less water'],
    ],
  },
]

export const TYPES = [
  { key: 'poly', name: 'Polyhouse', tag: 'Most popular', desc: 'Naturally ventilated, gothic-arch structure. Well suited to capsicum, cucumber and flowers.', rate: 950 },
  { key: 'net', name: 'Net House', tag: 'Budget', desc: 'Shade-net structure that protects crops from pests, hail and harsh sun.', rate: 450 },
  { key: 'glass', name: 'Glasshouse', tag: 'Premium', desc: 'Venlo-style glass with maximum light. Used for research, nurseries and high-value crops.', rate: 3200 },
  { key: 'hydro', name: 'Hydroponic', tag: 'High-tech', desc: 'Soil-less NFT system for leafy greens and herbs, with up to 90% water savings.', rate: 2400 },
]

export const ADDONS = [
  { key: 'climate', label: 'Fan & pad cooling', rate: 380 },
  { key: 'shade', label: 'Internal shade net', rate: 90 },
  { key: 'drip', label: 'Drip fertigation', rate: 120 },
  { key: 'iot', label: 'IoT automation', fixed: 150000 },
]

const base = import.meta.env.BASE_URL;

export const PROJECTS = [
  { img: `${base}images/polyhouse.png`, title: 'Sahyadri Capsicum Farm', meta: 'Nashik · 2 acres · Polyhouse', chips: ['Polyhouse', '2024'] },
  { img: `${base}images/glasshouse.png`, title: 'LeafCo Hydro Hub', meta: 'Pune · 6,000 m² · Hydroponic', chips: ['Hydroponic', '2025'] },
  { img: `${base}images/nethouse.png`, title: 'Green Valley Cluster', meta: 'Satara · 12 units · Net houses', chips: ['Net house', '2025'] },
]

export const PROCESS = [
  { title: 'Site survey', text: 'Soil, wind, sun path and water testing. We visit your land for free.', time: 'Week 1' },
  { title: '3D design & quote', text: 'A custom 3D layout, crop plan and transparent BOQ, plus help with your subsidy paperwork.', time: 'Week 2' },
  { title: 'Build', text: 'Our in-house crew handles foundation, frame, covering and systems.', time: 'Week 3–8' },
  { title: 'Grow & support', text: 'Agronomist visits, crop training and 5-year structural warranty.', time: 'Ongoing' },
]

export const STATS = [
  { value: 1200, suffix: '+', label: 'Greenhouses built' },
  { value: 850, suffix: '', label: 'Acres under cover' },
  { value: 14, suffix: '', label: 'States served' },
  { value: 98, suffix: '%', label: 'Repeat & referral rate' },
]

export const TESTIMONIALS = [
  { quote: 'Our capsicum yield tripled in the first season. The VerdeNest team handled everything, including the subsidy file.', name: 'Rahul Patil', role: 'Farmer, Nashik' },
  { quote: 'The 3D design made it easy to explain the project to the bank. The build finished 10 days ahead of schedule.', name: 'Sneha Kulkarni', role: 'Founder, LeafCo' },
  { quote: 'Their climate control keeps our nursery stable even in May. Support is just a WhatsApp away.', name: 'Imran Shaikh', role: 'Nursery owner, Satara' },
]
