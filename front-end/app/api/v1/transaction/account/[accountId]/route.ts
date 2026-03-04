import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const token = req.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ transactions: [] });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ transactions: [] });
    }

    const { accountId } = await params;

    // Verify the account belongs to the authenticated user
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { user_id: true },
    });

    if (!account || account.user_id !== payload.sub) {
      return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 403 });
    }

    // Fetch transactions for this account
    const transactions = await prisma.transaction.findMany({
      where: { account_id: accountId },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ transactions: [] });
  }
}
