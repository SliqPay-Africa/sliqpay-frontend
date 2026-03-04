import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('accessToken')?.value;
    if (!token) {
      // Return empty transactions instead of 401 for better UX
      return NextResponse.json({ transactions: [] });
    }
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ transactions: [] });
    }

    // Parse query params
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // Mock transactions for now - replace with actual database queries
    const transactions: any[] = [];

    return NextResponse.json({ transactions });
  } catch (error) {
    return NextResponse.json({ transactions: [] });
  }
}
