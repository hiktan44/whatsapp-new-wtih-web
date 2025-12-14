import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { getWaWebGroups } = await import('@/lib/wa-web-service');

    const groups = await getWaWebGroups();

    return NextResponse.json({
      success: true,
      groups
    });
  } catch (error: any) {
    console.error('Grupları getirme hatası:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('bağlı değil') ? 400 : 500 }
    );
  }
}
