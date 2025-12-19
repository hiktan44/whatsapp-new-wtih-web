import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { getContacts } = await import('@/lib/wa-web-service');

    const contacts = await getContacts();

    // CSV formatına dönüştür
    const csvHeader = 'İsim,Numara\n';
    const csvRows = contacts.map((c: any) => 
      `"${c.name || ''}","${c.phone || ''}"`
    ).join('\n');

    const csv = csvHeader + csvRows;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="whatsapp-contacts.csv"'
      }
    });
  } catch (error: any) {
    console.error('Kişileri export hatası:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
