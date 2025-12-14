import { NextRequest, NextResponse } from 'next/server'
import { getGroupById, updateGroup, deleteGroup } from '@/lib/db/groups'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const group = await getGroupById(params.id)
    
    if (!group) {
      return NextResponse.json(
        { error: 'Grup bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json(group)
  } catch (error) {
    console.error('Get group error:', error)
    return NextResponse.json(
      { error: 'Grup alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const group = await updateGroup(params.id, body)
    return NextResponse.json(group)
  } catch (error) {
    console.error('Update group error:', error)
    return NextResponse.json(
      { error: 'Grup güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteGroup(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete group error:', error)
    return NextResponse.json(
      { error: 'Grup silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
