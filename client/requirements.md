## Packages
dexie | Local IndexedDB wrapper for offline storage
dexie-react-hooks | React hooks for Dexie
papaparse | CSV parser for reading the Bible plan and examination framework
@types/papaparse | Types for papaparse
framer-motion | Smooth transitions between wizard steps
date-fns | Date manipulation for reading plans

## Notes
The app is a local-first PWA.
Data is stored in IndexedDB via Dexie.
No backend API calls are made except for health checks.
CSV files for reading plans and examination questions should be placed in `client/public/data/`.
