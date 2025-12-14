import { NextRequest, NextResponse } from 'next/server'
import { getGroups, createGroup, getGroupWithContactCount } from '@/lib/db/groups'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const withCount = searchParams.get('withCount') === 'true'

    let groups
    if (withCount) {
      groups = await getGroupWithContactCount()
    } else {
      groups = await getGroups()
    }

    return NextResponse.json(groups)
  } catch (error) {
    console.error('Get groups error:', error)
    return NextResponse.json(
      { error: 'Gruplar alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Grup adı zorunludur' },
        { status: 400 }
      )
    }

    const group = await createGroup({ name: name.trim(), description: description?.trim() })
    return NextResponse.json(group, { status: 201 })
  } catch (error) {
    console.error('Create group error:', error)
    return NextResponse.json(
      { error: 'Grup oluşturulurken bir hata oluştu' },
      { status: 500 }
    )
  }
}
