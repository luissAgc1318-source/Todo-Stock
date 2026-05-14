import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(request, { params }) {
  const { id } = await params
  const body = await request.json()
  const producto = await prisma.producto.update({
    where: { id: parseInt(id) },
    data: {
      nombre: body.nombre,
      descripcion: body.descripcion,
      precio: parseFloat(body.precio),
      stock: parseInt(body.stock),
      stockMinimo: parseInt(body.stockMinimo),
      categoriaId: parseInt(body.categoriaId)
    },
    include: { categoria: true }
  })
  return NextResponse.json(producto)
}

export async function DELETE(request, { params }) {
  const { id } = await params
  await prisma.producto.delete({
    where: { id: parseInt(id) }
  })
  return NextResponse.json({ mensaje: 'Producto eliminado' })
}