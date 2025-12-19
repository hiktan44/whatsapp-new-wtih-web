import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { getContacts } = await import('@/lib/wa-web-service');

    const contacts = await getContacts();

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
