import { NextResponse } from 'next/server';

export async function GET() {
  // Basit bir SVG favicon (binary .ico dosyası üretmeden 404'ü engeller)
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#22c55e"/>
      <stop offset="1" stop-color="#16a34a"/>
    </linearGradient>
  </defs>
  <rect x="6" y="6" width="52" height="52" rx="14" fill="url(#g)"/>
  <path d="M22 30c0-6 5-10 10-10s10 4 10 10-5 12-10 12c-2 0-4-.5-5.8-1.5l-4.8 1.5 1.6-4.5C22.6 35.6 22 32.9 22 30z"
        fill="#fff" opacity="0.95"/>
  <circle cx="28.5" cy="30" r="2" fill="#16a34a"/>
  <circle cx="35.5" cy="30" r="2" fill="#16a34a"/>
</svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      // Favicon isteği /favicon.ico olsa da SVG döndürmek 404'ü çözer.
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  });
}

