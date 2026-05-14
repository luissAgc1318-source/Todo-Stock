import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const productos = await prisma.producto.findMany({
    include: { categoria: true }
  })
  return NextResponse.json(productos)
}

export async function POST(request) {
  const body = await request.json()
  const producto = await prisma.producto.create({
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