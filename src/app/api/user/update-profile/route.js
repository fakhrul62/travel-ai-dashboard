import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ message: 'No image provided' }, { status: 400 });
    }

    // Basic validation to ensure it's a base64 image (starts with data:image/)
    if (!image.startsWith('data:image/')) {
      return NextResponse.json({ message: 'Invalid image format' }, { status: 400 });
    }

    await connectToDatabase();

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { image },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Profile picture updated successfully', image: updatedUser.image },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update Profile Error:', error);
    return NextResponse.json(
      { message: 'Failed to update profile picture', error: error.message },
      { status: 500 }
    );
  }
}
