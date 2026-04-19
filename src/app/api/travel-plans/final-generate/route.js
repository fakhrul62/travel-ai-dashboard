import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { destination, duration, budget, currency, travelers, startLocation } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ message: 'API Key missing' }, { status: 500 });

    // Initialize the standard Google AI SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Explicitly use getGenerativeModel with gemini-flash-latest
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const startText = startLocation ? ` starting from ${startLocation}` : '';
    const journeyText = startLocation ? `IMPORTANT: Your Day 1 itinerary must include specific travel steps from ${startLocation} to ${destination}.` : '';
    
    const promptText = `
      Create a ${duration}-day travel plan for ${travelers} people to ${destination}${startText}.
      Budget: ${budget} ${currency}.
      ${journeyText}
      CRITICAL INSTRUCTIONS: 
      1. You MUST construct the itinerary so that the Total Estimated Cost NEVER exceeds the provided Budget of ${budget} ${currency}. Do not suggest luxury options for low budgets.
      2. If and ONLY if the provided budget is absolutely impossible for this destination and duration, suggest a realistic budget in "suggestedBudget" (this MUST be a different, higher number than ${budget}). Otherwise, set "suggestedBudget" to null.
      Return ONLY a JSON object:
      {
        "title": "Title",
        "summary": "Summary",
        "estimatedCost": "4000",
        "suggestedBudget": "Optional suggested realistic budget if the provided one is too low",
        "weather": "Info",
        "packingList": ["A", "B"],
        "budgetBreakdown": { "accommodation": "30%", "food": "20%", "transport": "25%", "activities": "25%" },
        "travelAgencies": [{ "name": "Agency", "type": "Local", "offers": ["A"], "notIncluded": ["B"], "contact": "Link" }],
        "itinerary": [
          { 
            "day": 1, 
            "theme": "Arrival", 
            "dailyCost": "Total cost for this day in ${currency}",
            "activities": [
              { "time": "Morning", "title": "Journey", "description": "Travel from origin", "cost": "Estimated cost in ${currency}" },
              { "time": "Afternoon", "title": "Arrive", "description": "...", "cost": "Estimated cost in ${currency}" },
              { "time": "Evening", "title": "Dinner", "description": "...", "cost": "Estimated cost in ${currency}" }
            ] 
          }
        ]
      }
    `;

    // Call generateContent from the model instance
    const result = await model.generateContent(promptText);
    const response = await result.response;
    const text = response.text();

    if (!text) throw new Error('AI Error: No text returned');

    let cleanedText = text.trim();
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```json\n?/, '').replace(/```$/, '').trim();
    }

    const planDetails = JSON.parse(cleanedText);
    
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
    console.error('Gemini SDK Error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
