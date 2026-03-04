import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('accessToken')?.value;
    if (!token) {
      // Return empty balances instead of 401 for better UX
      return NextResponse.json({ balances: [] });
    }
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ balances: [] });
    }

    // Mock balances for now - replace with actual database queries
    const balances = [
      { currency: 'NGN', amount: 0.00, symbol: '₦' },
      { currency: 'GHS', amount: 0.00, symbol: '₵' },
      { currency: 'USD', amount: 0.00, symbol: '$' },
    ];

    return NextResponse.json({ balances });
  } catch (error) {
    return NextResponse.json({ balances: [] });
  }
}
