import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const walletSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  walletType: z.enum(['magic', 'external']),
  magicUserId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: { message: 'Invalid token' } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = walletSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: 'Validation failed', details: parsed.error.flatten() } },
        { status: 400 }
      );
    }

    const { walletAddress, walletType, magicUserId } = parsed.data;

    // Update user's wallet information
    const updatedUser = await prisma.user.update({
      where: { id: payload.sub },
      data: {
        wallet_address: walletAddress,
        wallet_type: walletType,
        magic_user_id: magicUserId,
      },
    });

    return NextResponse.json({
      message: 'Wallet saved successfully',
      walletAddress: updatedUser.wallet_address,
    });
  } catch (error: any) {
    console.error('Save wallet error:', error);
    return NextResponse.json(
      { error: { message: error.message || 'Failed to save wallet' } },
      { status: 500 }
    );
  }
}
