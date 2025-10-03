"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { productos, inventarioProductos } from "@/lib/data"
import type { Categoria } from "@/lib/types"
import { Pencil, Trash2 } from "lucide-react"

export function Inventario() {
  const [categoriaFiltro, setCategoriaFiltro] = useState<Categoria | "Todas">("Todas")

  const productosFiltrados = productos.filter((p) => categoriaFiltro === "Todas" || p.categoria === categoriaFiltro)

  const getInventario = (productoId: string) => {
    return inventarioProductos.find((inv) => inv.productoId === productoId)
  }

  const categorias: Array<{ id: Categoria | "Todas"; label: string; icon: string }> = [
    { id: "Todas", label: "Todas", icon: "🗂️" },
    { id: "Controles", label: "Controles", icon: "🎮" },
    { id: "Misceláneos", label: "Misceláneos", icon: "🔧" },
    { id: "Motores de Evaporador", label: "Motores", icon: "⚙️" },
  ]

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
          <div className="flex gap-2 flex-wrap">
            {categorias.map((cat) => (
              <Button
                key={cat.id}
                onClick={() => setCategoriaFiltro(cat.id)}
                variant={categoriaFiltro === cat.id ? "default" : "outline"}
                className={
                  categoriaFiltro === cat.id
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-white border-gray-300 text-black hover:bg-gray-50"
                }
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
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
                {productosFiltrados.map((producto) => {
                  const inventario = getInventario(producto.id)
                  const total = (inventario?.cantidadCancun || 0) + (inventario?.cantidadPlaya || 0)

                  return (
                    <TableRow key={producto.id} className="border-gray-200 hover:bg-gray-50">
                      <TableCell className="font-mono text-blue-600">{producto.sku}</TableCell>
                      <TableCell className="text-black font-medium">{producto.nombre}</TableCell>
                      <TableCell className="text-gray-600">{producto.categoria}</TableCell>
                      <TableCell className="text-right text-black">{inventario?.cantidadCancun || 0}</TableCell>
                      <TableCell className="text-right text-black">{inventario?.cantidadPlaya || 0}</TableCell>
                      <TableCell className="text-right text-black font-semibold">{total}</TableCell>
                      <TableCell className="text-right text-gray-600">${producto.costo.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-black font-medium">${producto.precio.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-green-600 font-semibold">
                        ${producto.utilidad.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
