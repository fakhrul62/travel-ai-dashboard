import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectToDatabase from '@/lib/mongodb';
import TravelPlan from '@/models/TravelPlan';

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await connectToDatabase();

    const plan = await TravelPlan.findOne({ _id: id, userId: session.user.id });

    if (!plan) {
      return NextResponse.json({ message: 'Plan not found or unauthorized' }, { status: 404 });
    }

    await TravelPlan.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Plan deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete Travel Plan Error:', error);
    return NextResponse.json(
      { message: 'Failed to delete plan', error: error.message },
      { status: 500 }
    );
  }
}
