# ✈️ Travel AI Dashboard

An intelligent travel itinerary generator powered by AI. Plan your perfect trip in minutes, no account required. Generate comprehensive travel plans with accommodations, activities, budget breakdowns, and weather insights.

**Live Demo:** [travel-ai-dashboard-k3pt.vercel.app](https://travel-ai-dashboard-k3pt.vercel.app)

---

## 🎯 Features

### 🤖 AI-Powered Trip Planning
- **Instant Itineraries** — Generate 5-day travel plans with complete day-by-day activities in seconds
- **Smart Budget Analysis** — AI-suggested budgets based on destination, duration, and travel style
- **Weather Insights** — Real-time weather conditions and packing recommendations
- **Activity Details** — Each activity includes time, location, cost estimates, and descriptions

### 👥 User Experience
- **No Login Required** — Generate plans as a guest instantly
- **Create Account** — Save, revisit, and refine your favorite itineraries
- **Personalized Plans** — Customize by destination, duration, budget, and traveler type
- **Verified Partners** — Recommended travel agencies and booking options

### 🎨 Modern UI/UX
- **Responsive Design** — Works seamlessly on mobile, tablet, and desktop
- **Dark Mode** — Eye-friendly interface with automatic theme detection
- **Smooth Animations** — Polished transitions and loading states
- **Accessible** — Built with accessibility best practices

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Google Generative AI API key ([get one here](https://ai.google.dev))
- MongoDB URI (for saving plans with account)
- NextAuth credentials (for user authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/fakhrul62/travel-ai-dashboard.git
   cd travel-ai-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   # AI & APIs
   GOOGLE_GENERATIVE_AI_KEY=your_google_api_key_here

   # Database
   MONGODB_URI=your_mongodb_connection_string

   # NextAuth
   NEXTAUTH_SECRET=your_secret_key
   NEXTAUTH_URL=http://localhost:3000
   GITHUB_ID=your_github_oauth_id
   GITHUB_SECRET=your_github_oauth_secret
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📱 How to Use

### Generate a Travel Plan (No Account)

1. **Enter Your Details**
   - **Starting Point**: Your current location (auto-detected or manual)
   - **Destination**: Where you want to travel
   - **Duration**: 1-14 days
   - **Budget**: Total budget for the trip
   - **Travelers**: Solo, couple, family, or group

2. **Click "Generate Plan"**
   - AI creates a comprehensive 5-day itinerary
   - View activities, costs, and recommendations

3. **Explore Your Itinerary**
   - Check day-by-day activities with times and costs
   - View weather insights and packing recommendations
   - See budget breakdown by category
   - Browse verified travel agencies

4. **Save for Later (Optional)**
   - Create a free account to save your plan
   - Access your saved itineraries anytime

### Manage Saved Plans (With Account)

1. **Sign Up** — Quick registration via email or GitHub
2. **Dashboard** — View all your saved travel plans
3. **Revisit & Refine** — Edit and regenerate plans with new parameters
4. **Share & Export** — Share itineraries with travel companions

---

## 🛠 Tech Stack

- **Frontend**: React 19, Next.js 16, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **AI**: Google Generative AI (Gemini)
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js with GitHub OAuth
- **Animations**: Framer Motion
- **Deployment**: Vercel

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login & register pages
│   ├── (dashboard)/         # Authenticated dashboard
│   ├── api/
│   │   ├── auth/           # NextAuth configuration
│   │   └── travel-plans/   # AI generation endpoints
│   ├── generate/           # Public guest generator
│   └── page.jsx            # Landing page
├── components/
│   ├── itinerary/          # Itinerary display components
│   └── providers/          # Context providers & wrappers
└── lib/
    ├── mongodb.js          # Database connection
    └── authOptions.js      # Auth configuration
```

---

## 🔗 API Endpoints

### Generate Travel Plan (Public)
```
POST /api/travel-plans/generate-plan

Request:
{
  "destination": "Paris",
  "startLocation": "London",
  "duration": 5,
  "budget": 3000,
  "travelers": "2",
  "currency": "EUR"
}

Response:
{
  "title": "Parisian Romance: 5-Day City Escape",
  "summary": "...",
  "itinerary": [...],
  "budgetBreakdown": {...},
  "weather": "...",
  "packingList": [...],
  "travelAgencies": [...]
}
```

### Save Plan (Authenticated)
```
POST /api/travel-plans/save
Authorization: Bearer <token>
```

---

## 🔐 Authentication

The app uses NextAuth.js with GitHub OAuth for secure authentication. Users can:
- Sign up with email or GitHub
- Securely save travel plans
- Access plans across devices
- Maintain account preferences

---

## 🌍 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import from GitHub
   - Add environment variables

3. **Deploy**
   - Vercel automatically deploys on push

### Environment Variables (Production)
Set these in your Vercel project settings:
- `GOOGLE_GENERATIVE_AI_KEY`
- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (your production domain)
- `GITHUB_ID`
- `GITHUB_SECRET`

---

## 📊 Performance & Optimization

- **Image Optimization**: Next.js Image component with lazy loading
- **Code Splitting**: Automatic route-based code splitting
- **Caching**: Optimized database queries and API responses
- **Mobile-First**: Responsive design tested on all device sizes
- **Accessibility**: WCAG 2.1 AA compliance

---

## 🐛 Troubleshooting

### "API Key not found"
- Ensure `GOOGLE_GENERATIVE_AI_KEY` is set in `.env.local`
- Restart the dev server after adding env vars

### Plans not saving
- Check MongoDB connection string in `.env.local`
- Verify NextAuth is configured correctly

### Mobile layout issues
- Clear browser cache
- Use Chrome DevTools device emulation
- Test on actual device

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs and suggest features
- Submit pull requests
- Improve documentation

---

## 📧 Support

Have questions? Reach out:
- **GitHub Issues**: [Report a bug](https://github.com/fakhrul62/travel-ai-dashboard/issues)
- **Email**: Check GitHub profile for contact

---

**Happy traveling! 🌍✈️**
