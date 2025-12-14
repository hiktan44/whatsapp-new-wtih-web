import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { getWaWebContacts } = await import('@/lib/wa-web-service');

    const contacts = await getWaWebContacts();

    return NextResponse.json({
      success: true,
      contacts
    });
  } catch (error: any) {
    console.error('Kişileri getirme hatası:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('bağlı değil') ? 400 : 500 }
    );
  }
}
