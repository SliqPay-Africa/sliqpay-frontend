import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const token = req.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ accounts: [] });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ accounts: [] });
    }

    const { userId } = await params;

    // Verify the requesting user matches the userId or has permission
    if (payload.sub !== userId) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 403 }
      );
    }

    // Fetch accounts from database
    const accounts = await prisma.account.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json({ accounts: [] });
  }
}
