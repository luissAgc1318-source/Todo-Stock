import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const categorias = await prisma.categoria.findMany()
  return NextResponse.json(categorias)
}

export async function POST(request) {
  const body = await request.json()
  const categoria = await prisma.categoria.create({
    data: { nombre: body.nombre }
  })
  return NextResponse.json(categoria)
}

export async function DELETE(request) {
  const { id } = await request.json()
  
  const productosEnCategoria = await prisma.producto.count({
    where: { categoriaId: parseInt(id) }
  })

  if (productosEnCategoria > 0) {
    return NextResponse.json(
      { error: `No puedes eliminar esta categoría, tiene ${productosEnCategoria} producto(s) asignado(s)` },
      { status: 400 }
    )
  }

  await prisma.categoria.delete({
    where: { id: parseInt(id) }
  })
  return NextResponse.json({ mensaje: 'Categoría eliminada' })
}