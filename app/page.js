'use client'
import * as XLSX from 'xlsx'
import { useState, useEffect } from 'react'
import { Package, Tag, AlertTriangle, DollarSign, Plus, Pencil, Trash2, Search, X } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import toast, { Toaster } from 'react-hot-toast'

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
}

function TarjetaStat({ icon: Icon, label, value, color, loading }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className={`flex items-center gap-2 ${color} mb-2`}>
        <Icon size={18} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {loading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-3xl font-bold text-gray-800">{value}</p>}
    </div>
  )
}

function getColorBarra(stock, stockMinimo) {
  if (stock <= stockMinimo) return '#ef4444'
  if (stock <= stockMinimo * 2) return '#f59e0b'
  return '#22c55e'
}

export default function Home() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [productoEditando, setProductoEditando] = useState(null)
  const [modalCategoria, setModalCategoria] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [form, setForm] = useState({
    nombre: '', descripcion: '', precio: '', stock: '', stockMinimo: '5', categoriaId: ''
  })
  const [formCategoria, setFormCategoria] = useState({ nombre: '' })

  useEffect(() => { cargarDatos() }, [])

  async function cargarDatos() {
    setCargando(true)
    try {
      const [p, c] = await Promise.all([
        fetch('/api/productos').then(r => r.json()),
        fetch('/api/categorias').then(r => r.json())
      ])
      setProductos(p)
      setCategorias(c)
    } catch {
      toast.error('Error al cargar los datos')
    } finally {
      setCargando(false)
    }
  }

  async function guardarProducto() {
    if (!form.nombre || !form.precio || !form.stock || !form.categoriaId) {
      toast.error('Por favor llena todos los campos requeridos')
      return
    }
    setGuardando(true)
    try {
      const url = productoEditando ? `/api/productos/${productoEditando.id}` : '/api/productos'
      const method = productoEditando ? 'PUT' : 'POST'
      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      toast.success(productoEditando ? '¡Producto actualizado!' : '¡Producto agregado!')
      cerrarModal()
      cargarDatos()
    } catch {
      toast.error('Error al guardar el producto')
    } finally {
      setGuardando(false)
    }
  }

  async function eliminarProducto(id, nombre) {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="font-medium">¿Eliminar <span className="text-red-500">{nombre}</span>?</p>
        <div className="flex gap-2">
          <button onClick={async () => {
            toast.dismiss(t.id)
            await fetch(`/api/productos/${id}`, { method: 'DELETE' })
            toast.success('Producto eliminado')
            cargarDatos()
          }} className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm">Eliminar</button>
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 border rounded-lg text-sm">Cancelar</button>
        </div>
      </div>
    ), { duration: 5000 })
  }

  async function guardarCategoria() {
    if (!formCategoria.nombre) { toast.error('Escribe un nombre para la categoría'); return }
    try {
      await fetch('/api/categorias', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formCategoria) })
      toast.success('¡Categoría creada!')
      setFormCategoria({ nombre: '' })
      cargarDatos()
    } catch {
      toast.error('Error al crear la categoría')
    }
  }

  async function eliminarCategoria(id, nombre) {
  const res = await fetch('/api/categorias', { 
    method: 'DELETE', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({ id }) 
  })
  const data = await res.json()
  if (!res.ok) {
    toast.error(data.error)
    return
  }
  toast.success(`Categoría "${nombre}" eliminada`)
  cargarDatos()
}

  function abrirEditar(producto) {
    setProductoEditando(producto)
    setForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      stock: producto.stock,
      stockMinimo: producto.stockMinimo,
      categoriaId: producto.categoriaId
    })
    setModalAbierto(true)
  }

  function cerrarModal() {
    setModalAbierto(false)
    setProductoEditando(null)
    setForm({ nombre: '', descripcion: '', precio: '', stock: '', stockMinimo: '5', categoriaId: '' })
  }
  function exportarExcel() {
  const datos = productos.map(p => ({
    'Producto': p.nombre,
    'Descripción': p.descripcion || '',
    'Categoría': p.categoria?.nombre,
    'Precio': p.precio,
    'Stock Actual': p.stock,
    'Stock Mínimo': p.stockMinimo,
    'Estado': p.stock <= p.stockMinimo ? 'Stock Bajo' : 'OK',
    'Valor Total': p.precio * p.stock
  }))
  const hoja = XLSX.utils.json_to_sheet(datos)
  const libro = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(libro, hoja, 'Inventario')
  XLSX.writeFile(libro, 'inventario.xlsx')
  toast.success('¡Excel descargado!')
}

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.categoria?.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const totalProductos = productos.length
  const stockBajo = productos.filter(p => p.stock <= p.stockMinimo).length
  const totalCategorias = categorias.length
  const valorTotal = productos.reduce((acc, p) => acc + p.precio * p.stock, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" toastOptions={{
        style: { borderRadius: '12px', fontSize: '14px' },
        success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } }
      }} />

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Package className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Todo-Stock</h1>
            <p className="text-xs text-gray-400">Sistema de gestión de inventario</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={exportarExcel} className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-600">
  <DollarSign size={15} /> Exportar Excel
</button>
          <button onClick={() => setModalCategoria(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-600">
            <Tag size={15} /> Categorías
          </button>
          <button onClick={() => setModalAbierto(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm">
            <Plus size={15} /> Nuevo Producto
          </button>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">

        {/* Tarjetas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <TarjetaStat icon={Package} label="Productos" value={totalProductos} color="text-blue-600" loading={cargando} />
          <TarjetaStat icon={AlertTriangle} label="Stock Bajo" value={stockBajo} color="text-red-500" loading={cargando} />
          <TarjetaStat icon={Tag} label="Categorías" value={totalCategorias} color="text-green-600" loading={cargando} />
          <TarjetaStat icon={DollarSign} label="Valor Total" value={`$${valorTotal.toFixed(2)}`} color="text-purple-600" loading={cargando} />
        </div>

        {/* Gráfica */}
        {cargando ? (
          <Skeleton className="h-64 w-full mb-6" />
        ) : productos.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-700">Stock por Producto</h2>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"/>OK</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"/>Bajo</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"/>Crítico</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={productos} barCategoryGap="30%">
                <XAxis dataKey="nombre" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '13px' }}
                  formatter={(value) => [`${value} unidades`, 'Stock']}
                />
                <Bar dataKey="stock" radius={[6, 6, 0, 0]}>
                  {productos.map((p, i) => (
                    <Cell key={i} fill={getColorBarra(p.stock, p.stockMinimo)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Buscador + Tabla */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-50 flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1 bg-gray-50 rounded-xl px-3 py-2">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por producto o categoría..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="bg-transparent text-sm outline-none flex-1 text-gray-700 placeholder-gray-400"
              />
              {busqueda && <button onClick={() => setBusqueda('')}><X size={14} className="text-gray-400 hover:text-gray-600" /></button>}
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">{productosFiltrados.length} resultado{productosFiltrados.length !== 1 ? 's' : ''}</span>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Producto', 'Categoría', 'Precio', 'Stock', 'Stock Mín.', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    {busqueda ? `No se encontró "${busqueda}"` : 'No hay productos aún. ¡Agrega el primero!'}
                  </td>
                </tr>
              ) : (
                productosFiltrados.map(p => (
                  <tr key={p.id} className="border-t border-gray-50 hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.nombre}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">{p.categoria?.nombre}</span>
                    </td>
                    <td className="px-4 py-3 font-medium">${p.precio.toFixed(2)}</td>
                    <td className="px-4 py-3 font-bold">{p.stock}</td>
                    <td className="px-4 py-3 text-gray-500">{p.stockMinimo}</td>
                    <td className="px-4 py-3">
                      {p.stock <= p.stockMinimo
                        ? <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium border border-red-100">⚠ Stock Bajo</span>
                        : <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium border border-green-100">✓ OK</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => abrirEditar(p)} className="p-2 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => eliminarProducto(p.id, p.nombre)} className="p-2 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Producto */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg text-gray-800">{productoEditando ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={cerrarModal} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={18} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Nombre *</label>
                <input placeholder="Ej. Laptop HP" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Descripción</label>
                <input placeholder="Opcional" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Precio *</label>
                  <input placeholder="0.00" type="number" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Stock *</label>
                  <input placeholder="0" type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Mínimo</label>
                  <input placeholder="5" type="number" value={form.stockMinimo} onChange={e => setForm({...form, stockMinimo: e.target.value})} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Categoría *</label>
                <select value={form.categoriaId} onChange={e => setForm({...form, categoriaId: e.target.value})} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Selecciona una categoría</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5 justify-end">
              <button onClick={cerrarModal} className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium">Cancelar</button>
              <button onClick={guardarProducto} disabled={guardando} className="px-4 py-2.5 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 min-w-24">
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Categoría */}
      {modalCategoria && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-gray-800">Categorías</h2>
              <button onClick={() => setModalCategoria(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={18} /></button>
            </div>
            <div className="mb-4 max-h-48 overflow-y-auto flex flex-col gap-1">
              {categorias.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No hay categorías aún</p>}
              {categorias.map(c => (
                <div key={c.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 group">
                  <span className="text-sm text-gray-700 font-medium">{c.nombre}</span>
                  <button onClick={() => eliminarCategoria(c.id, c.nombre)} className="p-1.5 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4">
              <label className="text-xs font-medium text-gray-500 mb-2 block">Nueva categoría</label>
              <div className="flex gap-2">
                <input
                  placeholder="Nombre"
                  value={formCategoria.nombre}
                  onChange={e => setFormCategoria({ nombre: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && guardarCategoria()}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button onClick={guardarCategoria} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}