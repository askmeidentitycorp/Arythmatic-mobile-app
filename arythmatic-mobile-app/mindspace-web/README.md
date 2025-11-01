# MindSpace (LUMI)

Install
- npm install
- npm run dev (http://localhost:3030)

Build
- npm run build && npm start

Online data (Supabase)
- Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local
- Apply supabase.sql in your Supabase SQL editor to create tables & RLS

Models (Transformers.js)
- By default loads Xenova/roberta-base-go-emotions online; optionally cache locally under public/models/roberta-go-emotions/

PWA
- Add to Home Screen to “download”.
- Add icons at public/icons/icon-192.png and icon-512.png for full install banners.

Deploy
- Push to Git and import into Vercel. Defaults work.
