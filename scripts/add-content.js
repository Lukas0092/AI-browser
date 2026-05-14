import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_PATH = join(__dirname, '..', 'public', 'data.json')
const data = JSON.parse(readFileSync(DATA_PATH, 'utf-8'))

// ── New categories ──
const newCategories = [
  {
    id: '3d',
    name: '3D',
    color: '#f472b6',
    tools: [
      { name: 'Meshy', tagline: 'AI 3D model generator', description: 'Meshy generates textured 3D models from text prompts or images in minutes. It supports PBR textures, multiple art styles, and exports to all major 3D formats. Used by game developers and 3D artists to rapidly prototype assets.', isFree: false, hasFreeTier: true, pricing: 'Free tier (limited), Pro $20/mo, Max $60/mo', specialty: 'Text and image to textured 3D model generation', website: 'https://www.meshy.ai', rank: 1 },
      { name: 'Tripo AI', tagline: 'Instant 3D from any input', description: 'Tripo AI creates high-quality 3D models from text descriptions, single images, or multi-view photos in under 10 seconds. Its speed and quality make it one of the fastest 3D generation tools available.', isFree: false, hasFreeTier: true, pricing: 'Free tier available, Pro $10/mo', specialty: 'Ultra-fast 3D model generation from text and images', website: 'https://www.tripo3d.ai', rank: 2 },
      { name: 'Spline AI', tagline: '3D design meets AI', description: 'Spline is a browser-based 3D design tool with AI generation built in. Create 3D scenes, animations, and interactive experiences using text prompts, then export to web, apps, or games.', isFree: false, hasFreeTier: true, pricing: 'Free tier available, Pro $9/mo, Team $18/mo', specialty: 'Browser-based 3D design with AI-assisted creation', website: 'https://spline.design', rank: 3 },
      { name: 'Kaedim', tagline: 'Turn 2D images into 3D models', description: 'Kaedim converts 2D images and concept art into production-ready 3D models. It combines AI generation with human quality checks to deliver clean, game-ready meshes with proper topology and UV maps.', isFree: false, hasFreeTier: true, pricing: 'Free trial, plans from $149/mo', specialty: 'Production-quality 3D from 2D concept art', website: 'https://www.kaedim3d.com', rank: 4 },
      { name: 'CSM AI', tagline: 'AI-powered 3D world creation', description: 'CSM (Common Sense Machines) generates interactive 3D worlds and objects from images, text, or sketches. Its models understand physical properties and can create entire scenes with proper lighting and physics.', isFree: false, hasFreeTier: true, pricing: 'Free tier available, Pro plans from $20/mo', specialty: '3D world and scene generation with physics understanding', website: 'https://www.csm.ai', rank: 5 },
    ]
  },
  {
    id: 'voice',
    name: 'Voice',
    color: '#14b8a6',
    tools: [
      { name: 'ElevenLabs', tagline: 'Ultra-realistic AI voice synthesis', description: 'ElevenLabs produces the most human-sounding AI speech available. Its voice cloning needs only seconds of audio to replicate any voice with emotional nuance, breathing patterns, and natural pacing.', isFree: false, hasFreeTier: true, pricing: 'Free tier (10k chars/mo), Starter $5/mo, Creator $22/mo, Pro $99/mo', specialty: 'Hyper-realistic voice cloning and multilingual text-to-speech', website: 'https://elevenlabs.io', rank: 1 },
      { name: 'PlayHT', tagline: 'AI voice generator for creators', description: 'PlayHT offers ultra-realistic text-to-speech with voice cloning capabilities. It supports 800+ AI voices across 140+ languages and can clone any voice from a 30-second sample.', isFree: false, hasFreeTier: true, pricing: 'Free tier available, Creator $31.20/mo, Pro $99/mo', specialty: 'Multilingual AI voices with instant voice cloning', website: 'https://play.ht', rank: 2 },
      { name: 'Resemble AI', tagline: 'Enterprise voice cloning platform', description: 'Resemble AI provides enterprise-grade voice cloning with real-time generation, emotion control, and language dubbing. Used by media companies and game studios for scalable voice production.', isFree: false, hasFreeTier: true, pricing: 'Free tier (limited), Pay-as-you-go from $0.006/sec', specialty: 'Enterprise voice cloning with emotion control', website: 'https://www.resemble.ai', rank: 3 },
      { name: 'Speechify', tagline: 'Listen to anything with AI voices', description: 'Speechify converts any text — articles, PDFs, emails, books — into natural-sounding audio. Its AI voices read content at adjustable speeds, making it popular for productivity and accessibility.', isFree: false, hasFreeTier: true, pricing: 'Free tier available, Premium $11.58/mo', specialty: 'Text-to-speech reader for documents and web content', website: 'https://speechify.com', rank: 4 },
      { name: 'WellSaid Labs', tagline: 'Studio-quality AI voiceover', description: 'WellSaid Labs creates broadcast-quality AI voiceovers for corporate training, marketing videos, and eLearning. Its voices are trained with professional voice actors and designed for enterprise use cases.', isFree: false, hasFreeTier: true, pricing: 'Free trial, plans from $44/mo', specialty: 'Professional AI voiceover for enterprise content', website: 'https://wellsaidlabs.com', rank: 5 },
    ]
  },
  {
    id: 'research',
    name: 'Research',
    color: '#6366f1',
    tools: [
      { name: 'Consensus', tagline: 'AI-powered academic search', description: 'Consensus uses AI to search through 200M+ scientific papers and extract findings. Ask a research question in plain language and get evidence-based answers with citations to peer-reviewed studies.', isFree: false, hasFreeTier: true, pricing: 'Free tier available, Premium $8.99/mo, Team $149/mo', specialty: 'Evidence-based answers from scientific literature', website: 'https://consensus.app', rank: 1 },
      { name: 'Elicit', tagline: 'AI research assistant', description: 'Elicit automates research workflows — finding papers, extracting data, summarizing findings, and synthesizing results across studies. It handles systematic literature reviews that would take weeks in hours.', isFree: false, hasFreeTier: true, pricing: 'Free tier (10 papers/mo), Plus $10/mo, Team $25/mo', specialty: 'Automated systematic literature reviews and data extraction', website: 'https://elicit.com', rank: 2 },
      { name: 'Semantic Scholar', tagline: 'AI-powered paper discovery', description: 'Semantic Scholar by the Allen Institute uses AI to analyze millions of papers and surface the most relevant research. Its TLDR feature auto-summarizes papers, and its citation analysis reveals research impact and trends.', isFree: true, hasFreeTier: true, pricing: 'Free', specialty: 'AI paper summarization and citation impact analysis', website: 'https://www.semanticscholar.org', rank: 3 },
      { name: 'Connected Papers', tagline: 'Visual paper exploration', description: 'Connected Papers creates interactive visual graphs of related academic papers. Enter one paper and see its connections to prior and derivative works, making it easy to explore a research field visually.', isFree: false, hasFreeTier: true, pricing: 'Free tier (5 graphs/mo), Academic $3/mo, Pro $6/mo', specialty: 'Visual research paper relationship mapping', website: 'https://www.connectedpapers.com', rank: 4 },
      { name: 'Scite', tagline: 'Smart citation analysis', description: 'Scite analyzes how papers cite each other — whether citations support, contrast, or simply mention findings. This citation context helps researchers evaluate the reliability and impact of research claims.', isFree: false, hasFreeTier: true, pricing: 'Free tier available, Student $10/mo, Researcher $20/mo', specialty: 'Citation context analysis (supporting vs contrasting)', website: 'https://scite.ai', rank: 5 },
    ]
  },
  {
    id: 'design',
    name: 'Design',
    color: '#f43f5e',
    tools: [
      { name: 'Canva AI', tagline: 'AI-powered design for everyone', description: 'Canva AI brings Magic Studio tools — text-to-image, background remover, Magic Eraser, AI presentations, and brand-consistent design generation — to the world\'s most popular design platform, used by over 170 million people.', isFree: false, hasFreeTier: true, pricing: 'Free tier available, Pro $13/mo, Teams $10/mo per person', specialty: 'AI-enhanced graphic design accessible to non-designers', website: 'https://www.canva.com', rank: 1 },
      { name: 'Figma AI', tagline: 'AI-assisted product design', description: 'Figma AI adds intelligent features to the leading product design tool — auto-layout suggestions, content generation, component search, and AI-powered prototyping that turns descriptions into interactive designs.', isFree: false, hasFreeTier: true, pricing: 'Free tier available, Professional $15/mo, Organization $45/mo', specialty: 'AI-enhanced product and UI/UX design workflows', website: 'https://www.figma.com', rank: 2 },
      { name: 'Looka', tagline: 'AI logo and brand kit generator', description: 'Looka generates professional logos and complete brand identity kits from a few prompts about your business. Get hundreds of logo options, then customize colors, fonts, and layouts to create a cohesive brand.', isFree: false, hasFreeTier: true, pricing: 'Free to generate, Basic $20 one-time, Premium $65 one-time', specialty: 'AI logo design and brand identity generation', website: 'https://looka.com', rank: 3 },
      { name: 'Photoroom', tagline: 'AI photo editing in seconds', description: 'Photoroom removes backgrounds, creates product photos, and generates marketing visuals instantly using AI. Used by millions of ecommerce sellers to create professional product images without a photo studio.', isFree: false, hasFreeTier: true, pricing: 'Free tier available, Pro $13/mo, Business $29/mo', specialty: 'AI product photography and background removal', website: 'https://www.photoroom.com', rank: 4 },
      { name: 'Vizcom', tagline: 'AI industrial design rendering', description: 'Vizcom turns rough sketches into photorealistic product renders in real-time. Industrial designers draw concepts by hand and Vizcom generates polished renders with materials, lighting, and environments.', isFree: false, hasFreeTier: true, pricing: 'Free tier available, Pro $25/mo, Team $50/mo', specialty: 'Sketch-to-render for industrial and product design', website: 'https://www.vizcom.ai', rank: 5 },
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing',
    color: '#84cc16',
    tools: [
      { name: 'AdCreative.ai', tagline: 'AI-generated ad creatives', description: 'AdCreative.ai generates high-converting ad creatives, banners, and social media posts using AI trained on millions of high-performing ads. It scores each creative for predicted conversion rate before you spend a dollar on ads.', isFree: false, hasFreeTier: true, pricing: 'Free trial, Starter $29/mo, Premium $59/mo', specialty: 'Conversion-optimized ad creative generation', website: 'https://www.adcreative.ai', rank: 1 },
      { name: 'Synthesia', tagline: 'AI video with virtual presenters', description: 'Synthesia creates professional videos with AI avatars that speak any script in 130+ languages. No cameras, actors, or studios needed — used by 50,000+ companies for training, marketing, and internal communications.', isFree: false, hasFreeTier: true, pricing: 'Free demo, Starter $22/mo, Creator $67/mo, Enterprise custom', specialty: 'AI avatar video production at scale', website: 'https://www.synthesia.io', rank: 2 },
      { name: 'Surfer SEO', tagline: 'AI-powered SEO optimization', description: 'Surfer SEO uses AI to analyze top-ranking pages and generate content guidelines for any keyword. Its AI writer creates SEO-optimized articles, and its audit tool identifies on-page improvements to boost rankings.', isFree: false, hasFreeTier: false, pricing: 'Essential $89/mo, Scale $129/mo, Enterprise custom', specialty: 'AI content optimization for search engine rankings', website: 'https://surferseo.com', rank: 3 },
      { name: 'Persado', tagline: 'AI marketing language platform', description: 'Persado uses AI to generate and optimize marketing language — email subject lines, ad copy, push notifications — based on what motivates specific audiences to take action. Used by major brands like JPMorgan and Marks & Spencer.', isFree: false, hasFreeTier: false, pricing: 'Enterprise pricing (contact sales)', specialty: 'AI-optimized marketing language generation', website: 'https://www.persado.com', rank: 4 },
      { name: 'Brandwatch', tagline: 'AI social media intelligence', description: 'Brandwatch uses AI to monitor and analyze social media conversations, brand sentiment, and emerging trends across the internet. It processes billions of data points to provide real-time consumer insights.', isFree: false, hasFreeTier: false, pricing: 'Custom pricing based on use case', specialty: 'AI social listening and consumer intelligence', website: 'https://www.brandwatch.com', rank: 5 },
    ]
  }
]

// ── Extra tools for existing categories ──
const extraTools = {
  video: [
    { name: 'Synthesia', tagline: 'AI video with virtual presenters', description: 'Synthesia creates professional videos with AI avatars that speak any script in 130+ languages. No cameras, actors, or studios needed — type your script, pick an avatar, and get a polished video in minutes.', isFree: false, hasFreeTier: true, pricing: 'Free demo, Starter $22/mo, Creator $67/mo', specialty: 'AI avatar video production at enterprise scale', website: 'https://www.synthesia.io', rank: 6 },
    { name: 'InVideo AI', tagline: 'Create videos with a prompt', description: 'InVideo AI generates complete videos from a single text prompt — script, scenes, stock footage, voiceover, music, and subtitles. Edit any part by chatting with the AI to refine the result.', isFree: false, hasFreeTier: true, pricing: 'Free tier (watermark), Plus $25/mo, Max $60/mo', specialty: 'Full video creation from text with AI editing', website: 'https://invideo.io', rank: 7 },
    { name: 'Opus Clip', tagline: 'AI short-form video from long content', description: 'Opus Clip uses AI to find the most engaging moments in long videos and automatically creates viral short clips for TikTok, Reels, and Shorts. It adds captions, reframes for vertical, and scores clips by virality potential.', isFree: false, hasFreeTier: true, pricing: 'Free tier (limited), Starter $19/mo, Pro $39/mo', specialty: 'AI-powered long-to-short video repurposing', website: 'https://www.opus.pro', rank: 8 },
  ],
  code: [
    { name: 'Tabnine', tagline: 'AI code completion that runs locally', description: 'Tabnine provides AI code completion that can run entirely on your machine for privacy. It supports 30+ languages, integrates with every major IDE, and offers teams a private AI model trained on their codebase.', isFree: false, hasFreeTier: true, pricing: 'Free tier available, Pro $12/mo, Enterprise custom', specialty: 'Privacy-first AI code completion with local deployment', website: 'https://www.tabnine.com', rank: 6 },
    { name: 'Cody', tagline: 'AI coding assistant by Sourcegraph', description: 'Cody by Sourcegraph understands your entire codebase — every repository, every dependency. It answers questions about your code, generates functions, and explains complex logic with full context awareness.', isFree: false, hasFreeTier: true, pricing: 'Free tier available, Pro $9/mo, Enterprise $19/mo per user', specialty: 'Full-codebase-aware AI coding assistance', website: 'https://sourcegraph.com/cody', rank: 7 },
    { name: 'Aider', tagline: 'AI pair programming in your terminal', description: 'Aider is an open-source AI pair programmer that works in your terminal. It can edit multiple files, handle git commits, and work with any LLM. Popular among developers who prefer command-line workflows.', isFree: true, hasFreeTier: true, pricing: 'Free (open source), bring your own API key', specialty: 'Terminal-based AI pair programming with git integration', website: 'https://aider.chat', rank: 8 },
  ],
  chat: [
    { name: 'Microsoft Copilot', tagline: 'AI assistant across Microsoft 365', description: 'Microsoft Copilot integrates GPT-4 across Windows, Edge, Bing, and Office 365. It drafts emails in Outlook, creates presentations in PowerPoint, analyzes data in Excel, and provides a general AI assistant across the Microsoft ecosystem.', isFree: false, hasFreeTier: true, pricing: 'Free tier available, Pro $20/mo, Microsoft 365 Copilot $30/mo per user', specialty: 'Deep Microsoft 365 integration with enterprise AI', website: 'https://copilot.microsoft.com', rank: 6 },
    { name: 'Pi', tagline: 'Your personal AI companion', description: 'Pi by Inflection AI is designed as a personal AI companion — empathetic, conversational, and supportive. Unlike productivity-focused assistants, Pi excels at coaching, brainstorming, and being a thoughtful conversational partner.', isFree: true, hasFreeTier: true, pricing: 'Free', specialty: 'Empathetic personal AI with coaching abilities', website: 'https://pi.ai', rank: 7 },
  ],
  image: [
    { name: 'Leonardo AI', tagline: 'AI image platform for creators', description: 'Leonardo AI offers fine-tuned image generation models, real-time canvas editing, and a texture generation pipeline for game assets. Its model training lets users create custom AI models tuned to their specific art style.', isFree: false, hasFreeTier: true, pricing: 'Free tier (150 tokens/day), Apprentice $12/mo, Artisan $30/mo', specialty: 'Custom AI model training and game asset generation', website: 'https://leonardo.ai', rank: 6 },
    { name: 'Adobe Firefly', tagline: 'AI creativity from Adobe', description: 'Adobe Firefly is trained exclusively on licensed and public domain content, making it commercially safe to use. Integrated into Photoshop, Illustrator, and Express, it offers generative fill, text effects, and image generation within Adobe workflows.', isFree: false, hasFreeTier: true, pricing: 'Free tier (25 credits/mo), Premium $10/mo', specialty: 'Commercially safe AI image generation in Adobe tools', website: 'https://firefly.adobe.com', rank: 7 },
    { name: 'Playground AI', tagline: 'Free AI image creation', description: 'Playground AI offers a generous free tier for AI image generation with multiple models, real-time editing, and a community gallery. Its mixed editing mode combines AI generation with traditional image editing tools.', isFree: false, hasFreeTier: true, pricing: 'Free tier (500 images/day), Pro $15/mo', specialty: 'Generous free AI image generation with editing tools', website: 'https://playground.com', rank: 8 },
  ],
  music: [
    { name: 'Boomy', tagline: 'Create and release AI songs instantly', description: 'Boomy lets anyone create original songs in seconds and release them to streaming platforms like Spotify. No musical experience needed — pick a style, customize it, and monetize your music through their distribution network.', isFree: false, hasFreeTier: true, pricing: 'Free tier available, Creator $2.99/mo, Pro $9.99/mo', specialty: 'AI music creation with instant streaming distribution', website: 'https://boomy.com', rank: 6 },
    { name: 'Splash', tagline: 'AI music for games and apps', description: 'Splash provides AI music tools designed for games, apps, and interactive media. Its SDK generates adaptive music that responds to gameplay in real-time, plus a consumer app for creating original songs.', isFree: false, hasFreeTier: true, pricing: 'Free tier available, Pro plans for commercial use', specialty: 'Adaptive AI music for games and interactive media', website: 'https://www.splashmusic.com', rank: 7 },
  ],
  productivity: [
    { name: 'Taskade', tagline: 'AI-powered project management', description: 'Taskade combines project management with AI agents that can automate workflows, generate content, and manage tasks autonomously. It offers AI-powered docs, mind maps, and chat in a unified workspace.', isFree: false, hasFreeTier: true, pricing: 'Free tier available, Pro $8/mo per user', specialty: 'AI agents for automated project management', website: 'https://www.taskade.com', rank: 6 },
    { name: 'Mem', tagline: 'AI-powered knowledge base', description: 'Mem uses AI to organize your notes, meetings, and knowledge automatically. It surfaces relevant information when you need it, connects related ideas, and generates drafts from your accumulated knowledge.', isFree: false, hasFreeTier: true, pricing: 'Free tier available, Premium $14.99/mo, Team $19.99/mo', specialty: 'Self-organizing AI knowledge management', website: 'https://mem.ai', rank: 7 },
  ],
  school: [
    { name: 'Photomath', tagline: 'AI math problem solver', description: 'Photomath lets students snap a photo of any math problem and get step-by-step solutions instantly. It covers arithmetic through calculus, showing multiple solution methods and animated explanations.', isFree: false, hasFreeTier: true, pricing: 'Free tier (basic), Plus $9.99/mo', specialty: 'Camera-based math solving with step-by-step explanations', website: 'https://photomath.com', rank: 6 },
    { name: 'Duolingo Max', tagline: 'AI-powered language learning', description: 'Duolingo Max adds GPT-4 powered features — Explain My Answer gives personalized grammar explanations, and Roleplay lets you practice conversations with AI characters in real-world scenarios.', isFree: false, hasFreeTier: true, pricing: 'Free tier available, Super $7/mo, Max $14/mo', specialty: 'AI-enhanced language learning with conversation practice', website: 'https://www.duolingo.com', rank: 7 },
  ],
  fitness: [
    { name: 'Whoop', tagline: 'AI recovery and strain tracking', description: 'Whoop uses AI to analyze heart rate variability, sleep quality, and daily strain to provide personalized recovery scores and training recommendations. Its AI coach adapts advice based on your physiological data.', isFree: false, hasFreeTier: false, pricing: '$30/mo (includes wearable), Annual $239', specialty: 'AI-driven physiological recovery and strain optimization', website: 'https://www.whoop.com', rank: 6 },
    { name: 'Freeletics', tagline: 'AI bodyweight training coach', description: 'Freeletics uses AI to create personalized bodyweight workout plans that adapt based on your performance and feedback. No gym needed — it generates HIIT and strength workouts using just your body weight.', isFree: false, hasFreeTier: true, pricing: 'Free tier (limited), Coach $34.99/quarter', specialty: 'Adaptive AI bodyweight and HIIT training', website: 'https://www.freeletics.com', rank: 7 },
  ],
}

// ── Collections (Netflix-style rows) ──
const collections = [
  {
    id: 'risingStars',
    name: 'Rising Stars',
    color: '#f97316',
    tools: [
      { name: 'Lovable', category: 'code' },
      { name: 'Bolt.new', category: 'code' },
      { name: 'v0', category: 'code' },
      { name: 'Recraft V3', source: 'newThisWeek' },
      { name: 'ElevenLabs', category: 'voice' },
      { name: 'Meshy', category: '3d' },
      { name: 'Granola', source: 'newThisWeek' },
      { name: 'Opus Clip', category: 'video' },
    ]
  },
  {
    id: 'bestFree',
    name: 'Best Free Tools',
    color: '#10b981',
    tools: [
      { name: 'Stable Diffusion 3', category: 'image' },
      { name: 'Flux', category: 'image' },
      { name: 'Google NotebookLM', category: 'school' },
      { name: 'Semantic Scholar', category: 'research' },
      { name: 'Aider', category: 'code' },
      { name: 'Pi', category: 'chat' },
      { name: 'Boomy', category: 'music' },
      { name: 'Playground AI', category: 'image' },
    ]
  },
  {
    id: 'creatorToolkit',
    name: "Creator's Toolkit",
    color: '#ec4899',
    tools: [
      { name: 'Midjourney', category: 'image' },
      { name: 'Canva AI', category: 'design' },
      { name: 'Descript', source: 'newThisWeek' },
      { name: 'Gamma', category: 'productivity' },
      { name: 'Suno', category: 'music' },
      { name: 'Synthesia', category: 'marketing' },
      { name: 'Photoroom', category: 'design' },
      { name: 'Opus Clip', category: 'video' },
    ]
  },
  {
    id: 'devEssentials',
    name: 'Developer Essentials',
    color: '#4ecdc4',
    tools: [
      { name: 'Cursor', category: 'code' },
      { name: 'GitHub Copilot', category: 'code' },
      { name: 'Bolt.new', category: 'code' },
      { name: 'v0', category: 'code' },
      { name: 'Lovable', source: 'newThisWeek' },
      { name: 'Tabnine', category: 'code' },
      { name: 'Cody', category: 'code' },
      { name: 'Devin', category: 'code' },
    ]
  },
]

// ── Apply changes ──

// Add new categories
for (const cat of newCategories) {
  if (!data.categories.find(c => c.id === cat.id)) {
    data.categories.push(cat)
    console.log(`Added category: ${cat.name} (${cat.tools.length} tools)`)
  }
}

// Add extra tools to existing categories
for (const [catId, tools] of Object.entries(extraTools)) {
  const cat = data.categories.find(c => c.id === catId)
  if (!cat) continue
  for (const tool of tools) {
    if (!cat.tools.find(t => t.name === tool.name)) {
      cat.tools.push(tool)
    }
  }
  console.log(`${cat.name}: now ${cat.tools.length} tools`)
}

// Add collections
data.collections = collections
console.log(`Added ${collections.length} collections`)

// Count totals
let total = 0
for (const cat of data.categories) total += cat.tools.length
total += (data.newThisWeek || []).length
console.log(`\nTotal tools: ${total}`)

writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + '\n')
console.log('Saved data.json')
