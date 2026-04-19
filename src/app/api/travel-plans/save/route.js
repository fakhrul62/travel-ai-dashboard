import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectToDatabase from '@/lib/mongodb';
import TravelPlan from '@/models/TravelPlan';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { destination, duration, budget, currency, travelers, planDetails, coverImage } = await req.json();

    if (!destination || !planDetails) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    const newPlan = await TravelPlan.create({
      userId: session.user.id,
      destination,
      duration,
      budget,
      currency,
      travelers,
      planDetails,
      coverImage
    });

    return NextResponse.json({ message: 'Plan saved successfully', planId: newPlan._id }, { status: 201 });
  } catch (error) {
    console.error('Travel Plan Save Error:', error);
    return NextResponse.json(
      { message: 'Failed to save plan', error: error.message },
      { status: 500 }
    );
  }
}
