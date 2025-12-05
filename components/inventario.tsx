"use client"

import { useState, useEffect, Fragment } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { productos, inventarioProductos } from "@/lib/data"
import { supabase } from "@/lib/supabaseClient"
import type { Categoria, InventarioItem, Producto } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2 } from "lucide-react"

export function Inventario() {
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("Todas")
  const [productosState, setProductosState] = useState<Producto[]>(productos)
  const [inventarioState, setInventarioState] = useState<InventarioItem[]>(inventarioProductos)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ costo: number; precio: number; cantidadCancun: number; cantidadPlaya: number }>({
    costo: 0,
    precio: 0,
    cantidadCancun: 0,
    cantidadPlaya: 0,
  })

  // Load from Supabase (refacciones) on mount
  useEffect(() => {
    const loadRefacciones = async () => {
      const { data, error } = await supabase.from("refacciones").select("*")
      if (error) {
        console.error("Error cargando refacciones:", error.message)
        return
      }
      if (!data) return
      // Map rows to local product and inventory states
      const productosFromDb: Producto[] = data.map((r: any) => ({
        id: r.id,
        sku: r.sku,
        nombre: r.nombre,
        categoria: r.categoria as Categoria,
        costo: Number(r.costo),
        precio: Number(r.precio),
        utilidad: Number(r.precio) - Number(r.costo),
      }))

      const inventarioFromDb: InventarioItem[] = data.map((r: any) => ({
        productoId: r.id,
        cantidadCancun: Number(r.cantidad_cancun ?? 0),
        cantidadPlaya: Number(r.cantidad_playa ?? 0),
      }))

      setProductosState(productosFromDb)
      setInventarioState(inventarioFromDb)
    }
    loadRefacciones()
  }, [])

  const productosFiltrados = productosState
    .filter((p) => categoriaFiltro === "Todas" || p.categoria === categoriaFiltro)

  // Categorías ordenadas presentes en el resultado filtrado
  const categoriasOrdenadas = Array.from(new Set(productosFiltrados.map((p) => p.categoria))).sort((a, b) => {
    return a.localeCompare(b)
  })

  const getInventario = (productoId: string) => {
    return inventarioState.find((inv) => inv.productoId === productoId)
  }

  // Categorías dinámicas desde productos cargados (incluye las nuevas desde Supabase)
  const categorias: string[] = [
    "Todas",
    ...Array.from(new Set(productosState.map((p) => p.categoria))),
  ]

  const startEdit = (producto: Producto) => {
    const inv = getInventario(producto.id)
    setEditingId(producto.id)
    setEditValues({
      costo: producto.costo,
      precio: producto.precio,
      cantidadCancun: inv?.cantidadCancun ?? 0,
      cantidadPlaya: inv?.cantidadPlaya ?? 0,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = async (productoId: string) => {
    // Persistir cambios a Supabase (tabla refacciones)
    const { error } = await supabase
      .from("refacciones")
      .update({
        costo: editValues.costo,
        precio: editValues.precio,
        cantidad_cancun: editValues.cantidadCancun,
        cantidad_playa: editValues.cantidadPlaya,
      })
      .eq("id", productoId)

    if (error) {
      console.error("Error al actualizar en Supabase:", error.message)
      alert(`No se pudo guardar: ${error.message}`)
      return
    }

    // Actualizar estado local
    setProductosState((prev) =>
      prev.map((p) =>
        p.id === productoId
          ? { ...p, costo: editValues.costo, precio: editValues.precio, utilidad: editValues.precio - editValues.costo }
          : p
      )
    )

    setInventarioState((prev) => {
      const exists = prev.some((i) => i.productoId === productoId)
      if (exists) {
        return prev.map((i) =>
          i.productoId === productoId
            ? { ...i, cantidadCancun: editValues.cantidadCancun, cantidadPlaya: editValues.cantidadPlaya }
            : i
        )
      }
      return [
        ...prev,
        { productoId, cantidadCancun: editValues.cantidadCancun, cantidadPlaya: editValues.cantidadPlaya },
      ]
    })

    setEditingId(null)
    alert("Cambios guardados en inventario (Supabase)")
  }

  const deleteProducto = async (productoId: string) => {
    const producto = productosState.find((p) => p.id === productoId)
    const nombre = producto?.nombre ?? productoId
    if (typeof window !== "undefined") {
      const ok = window.confirm(`¿Eliminar el producto "${nombre}" y su inventario asociado?`)
      if (!ok) return
    }

    const { error } = await supabase.from("refacciones").delete().eq("id", productoId)
    if (error) {
      console.error("Error al eliminar en Supabase:", error.message)
      alert(`No se pudo eliminar: ${error.message}`)
      return
    }

    setProductosState((prev) => prev.filter((p) => p.id !== productoId))
    setInventarioState((prev) => prev.filter((i) => i.productoId !== productoId))

    if (editingId === productoId) {
      setEditingId(null)
    }
    alert("Producto eliminado del inventario (Supabase)")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black">Inventario de Refacciones</h1>
      </div>

      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-black">Filtros por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Contenedor de filtros con scroll horizontal en móvil */}
          <div className="flex md:flex-wrap gap-2 overflow-x-auto whitespace-nowrap -mx-2 px-2">
            {categorias.map((cat) => (
              <Button
                key={cat}
                onClick={() => setCategoriaFiltro(cat)}
                variant={categoriaFiltro === cat ? "default" : "outline"}
                className={
                  categoriaFiltro === cat
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-white border-gray-300 text-black hover:bg-gray-50"
                }
              >
                {cat}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vista de escritorio: tabla completa */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-gray-50">
                  <TableHead className="text-gray-700">SKU</TableHead>
                  <TableHead className="text-gray-700">Producto</TableHead>
                  <TableHead className="text-gray-700">Categoría</TableHead>
                  <TableHead className="text-gray-700 text-right">Cancún</TableHead>
                  <TableHead className="text-gray-700 text-right">Playa</TableHead>
                  <TableHead className="text-gray-700 text-right">Total</TableHead>
                  <TableHead className="text-gray-700 text-right">Costo</TableHead>
                  <TableHead className="text-gray-700 text-right">Precio</TableHead>
                  <TableHead className="text-gray-700 text-right">Utilidad</TableHead>
                  <TableHead className="text-gray-700 text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoriasOrdenadas.map((cat) => (
                  <Fragment key={cat}>
                    {/* Cabecera de categoría con ligera separación */}
                    <TableRow>
                      <TableCell colSpan={10} className="bg-gray-50 text-gray-700 font-semibold border-t border-gray-300">
                        {cat}
                      </TableCell>
                    </TableRow>
                    {productosFiltrados
                      .filter((p) => p.categoria === cat)
                      .map((producto) => {
                        const inventario = getInventario(producto.id)
                        const total = (inventario?.cantidadCancun || 0) + (inventario?.cantidadPlaya || 0)
                        const utilidadCalc = producto.precio - producto.costo

                        return (
                          <TableRow key={producto.id} className="border-gray-200 hover:bg-gray-50">
                            <TableCell className="font-mono text-blue-600">{producto.sku}</TableCell>
                            <TableCell className="text-black font-medium">
                              <div className="whitespace-normal break-words max-w-[320px] lg:max-w-[420px]">
                                {producto.nombre}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-600">{producto.categoria}</TableCell>
                            <TableCell className="text-right text-black">
                              {editingId === producto.id ? (
                                <Input
                                  type="number"
                                  value={editValues.cantidadCancun}
                                  onChange={(e) =>
                                    setEditValues((v) => ({ ...v, cantidadCancun: Number.parseInt(e.target.value || "0") }))
                                  }
                                  className="w-24 bg-white border-gray-300 text-black"
                                />
                              ) : (
                                inventario?.cantidadCancun || 0
                              )}
                            </TableCell>
                            <TableCell className="text-right text-black">
                              {editingId === producto.id ? (
                                <Input
                                  type="number"
                                  value={editValues.cantidadPlaya}
                                  onChange={(e) =>
                                    setEditValues((v) => ({ ...v, cantidadPlaya: Number.parseInt(e.target.value || "0") }))
                                  }
                                  className="w-24 bg-white border-gray-300 text-black"
                                />
                              ) : (
                                inventario?.cantidadPlaya || 0
                              )}
                            </TableCell>
                            <TableCell className="text-right text-black font-semibold">{total}</TableCell>
                            <TableCell className="text-right text-gray-600">
                              {editingId === producto.id ? (
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={editValues.costo}
                                  onChange={(e) =>
                                    setEditValues((v) => ({ ...v, costo: Number.parseFloat(e.target.value || "0") }))
                                  }
                                  className="w-28 bg-white border-gray-300 text-black"
                                />
                              ) : (
                                <>{formatCurrency(producto.costo)}</>
                              )}
                            </TableCell>
                            <TableCell className="text-right text-black font-medium">
                              {editingId === producto.id ? (
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={editValues.precio}
                                  onChange={(e) =>
                                    setEditValues((v) => ({ ...v, precio: Number.parseFloat(e.target.value || "0") }))
                                  }
                                  className="w-28 bg-white border-gray-300 text-black"
                                />
                              ) : (
                                <>{formatCurrency(producto.precio)}</>
                              )}
                            </TableCell>
                            <TableCell className="text-right text-green-600 font-semibold">
                              {formatCurrency(utilidadCalc)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2 justify-center">
                                {editingId === producto.id ? (
                                  <>
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                      onClick={() => saveEdit(producto.id)}
                                    >
                                      Guardar
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-gray-700 border-gray-300 hover:bg-gray-50"
                                      onClick={cancelEdit}
                                    >
                                      Cancelar
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                      onClick={() => startEdit(producto)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => deleteProducto(producto.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Vista móvil: tarjetas compactas con edición inline */}
      <div className="block md:hidden space-y-4">
        {categoriasOrdenadas.map((cat) => (
          <Fragment key={cat}>
            {/* Cabecera de categoría para móvil */}
            <div className="text-sm font-semibold text-gray-700 px-1">{cat}</div>
            {productosFiltrados
              .filter((p) => p.categoria === cat)
              .map((producto) => {
                const inventario = getInventario(producto.id)
                const total = (inventario?.cantidadCancun || 0) + (inventario?.cantidadPlaya || 0)
                const utilidadCalc = producto.precio - producto.costo

                return (
                  <Card key={producto.id} className="bg-white border-gray-200">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-mono text-blue-600">{producto.sku}</div>
                          <div className="text-base font-semibold text-black whitespace-normal break-words">
                            {producto.nombre}
                          </div>
                          <div className="text-xs text-gray-600">{producto.categoria}</div>
                        </div>
                        <div className="flex gap-2">
                          {editingId === producto.id ? (
                            <>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => saveEdit(producto.id)}>
                                Guardar
                              </Button>
                              <Button size="sm" variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-50" onClick={cancelEdit}>
                                Cancelar
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => startEdit(producto)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => deleteProducto(producto.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Cantidades */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-600">Cancún</div>
                          {editingId === producto.id ? (
                            <Input
                              type="number"
                              value={editValues.cantidadCancun}
                              onChange={(e) => setEditValues((v) => ({ ...v, cantidadCancun: Number.parseInt(e.target.value || "0") }))}
                              className="bg-white border-gray-300 text-black"
                            />
                          ) : (
                            <div className="text-sm text-black font-medium">{inventario?.cantidadCancun || 0}</div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Playa</div>
                          {editingId === producto.id ? (
                            <Input
                              type="number"
                              value={editValues.cantidadPlaya}
                              onChange={(e) => setEditValues((v) => ({ ...v, cantidadPlaya: Number.parseInt(e.target.value || "0") }))}
                              className="bg-white border-gray-300 text-black"
                            />
                          ) : (
                            <div className="text-sm text-black font-medium">{inventario?.cantidadPlaya || 0}</div>
                          )}
                        </div>
                      </div>

                      {/* Totales y precios */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-600">Total</div>
                          <div className="text-sm text-black font-semibold">{total}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Utilidad</div>
                          <div className="text-sm text-green-600 font-semibold">{formatCurrency(utilidadCalc)}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-600">Costo</div>
                          {editingId === producto.id ? (
                            <Input
                              type="number"
                              step="0.01"
                              value={editValues.costo}
                              onChange={(e) => setEditValues((v) => ({ ...v, costo: Number.parseFloat(e.target.value || "0") }))}
                              className="bg-white border-gray-300 text-black"
                            />
                          ) : (
                            <div className="text-sm text-gray-700">{formatCurrency(producto.costo)}</div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Precio</div>
                          {editingId === producto.id ? (
                            <Input
                              type="number"
                              step="0.01"
                              value={editValues.precio}
                              onChange={(e) => setEditValues((v) => ({ ...v, precio: Number.parseFloat(e.target.value || "0") }))}
                              className="bg-white border-gray-300 text-black"
                            />
                          ) : (
                            <div className="text-sm text-black font-medium">{formatCurrency(producto.precio)}</div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
