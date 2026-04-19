import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectToDatabase from '@/lib/mongodb';
import TravelPlan from '@/models/TravelPlan';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Fetch plans sorted by newest first
    const plans = await TravelPlan.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ plans }, { status: 200 });
  } catch (error) {
    console.error('Fetch Travel Plans Error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch plans', error: error.message },
      { status: 500 }
    );
  }
}
