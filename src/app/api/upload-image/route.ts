import { NextRequest, NextResponse } from 'next/server'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = Buffer.from(await file.arrayBuffer())
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const ext = (file.name?.split('.').pop() || 'bin').toLowerCase()
    const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`
    const filepath = path.join(uploadDir, filename)

    await writeFile(filepath, bytes)

    return NextResponse.json({ location: `/uploads/${filename}` })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Upload failed' }, { status: 500 })
  }
}
