import { NextRequest, NextResponse } from 'next/server'
import { uploadFile, validateFileSize, validateFileType } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
        { status: 400 }
      )
    }

    // Dosya boyutu kontrolü (50MB)
    if (!validateFileSize(file, 50)) {
      return NextResponse.json(
        { error: 'Dosya boyutu 50MB\'dan büyük olamaz' },
        { status: 400 }
      )
    }

    // Dosya tipi kontrolü
    if (!validateFileType(file)) {
      return NextResponse.json(
        { error: 'Desteklenmeyen dosya tipi' },
        { status: 400 }
      )
    }

    // Dosyayı yükle
    const result = await uploadFile(file, 'uploads')

    return NextResponse.json({
      success: true,
      url: result.url,
      path: result.path,
      type: result.type,
      filename: file.name,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Dosya yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
