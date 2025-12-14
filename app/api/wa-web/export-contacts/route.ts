import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { getWaWebContacts } = await import('@/lib/wa-web-service');

    const contacts = await getWaWebContacts();

    // CSV formatına dönüştür
    const csvHeader = 'İsim,Numara,Kayıtlı Kişi\n';
    const csvRows = contacts.map(c => 
      `"${c.name}","${c.number}","${c.isMyContact ? 'Evet' : 'Hayır'}"`
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
