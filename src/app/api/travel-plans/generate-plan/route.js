import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { destination, duration, budget, currency, travelers, startLocation } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ message: 'API Key missing' }, { status: 500 });

    const startText = startLocation ? ` starting from ${startLocation}` : '';
    const journeyText = startLocation ? `IMPORTANT: Your Day 1 itinerary must include specific travel steps from ${startLocation} to ${destination}.` : '';
    
    const promptText = `
      Create a ${duration}-day travel plan for ${travelers} people to ${destination}${startText}.
      Budget: ${budget} ${currency}.
      ${journeyText}
      Return ONLY a JSON object:
      {
        "title": "Title",
        "summary": "Summary",
        "estimatedCost": "4000",
        "weather": "Info",
        "packingList": ["A", "B"],
        "budgetBreakdown": { "accommodation": "30%", "food": "20%", "transport": "25%", "activities": "25%" },
        "travelAgencies": [{ "name": "Agency", "type": "Local", "offers": ["A"], "notIncluded": ["B"], "contact": "Link" }],
        "itinerary": [{ "day": 1, "theme": "Arrival", "activities": [{ "time": "Morning", "title": "Journey", "description": "Travel from origin" }, { "time": "Afternoon", "title": "Arrive", "description": "..." }, { "time": "Evening", "title": "Dinner", "description": "..." }] }]
      }
    `;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
    
    const aiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const aiData = await aiRes.json();
    
    if (!aiRes.ok) {
      console.error('Gemini API Error:', aiData);
      return NextResponse.json({ message: aiData.error?.message || 'AI Error' }, { status: 500 });
    }

    let aiText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    aiText = aiText.trim();
    if (aiText.startsWith('```')) {
      aiText = aiText.replace(/^```json\n?/, '').replace(/```$/, '').trim();
    }

    const planDetails = JSON.parse(aiText);
    
    let coverImage = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop';
    try {
      if (process.env.UNSPLASH_ACCESS_KEY) {
        const unsplashRes = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(destination)}&orientation=landscape&per_page=1`, {
          headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` }
        });
        const unsplashData = await unsplashRes.json();
        if (unsplashData.results?.[0]?.urls?.regular) coverImage = unsplashData.results[0].urls.regular;
      }
    } catch (e) {}

    planDetails.coverImage = coverImage;
    return NextResponse.json({ plan: planDetails }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
