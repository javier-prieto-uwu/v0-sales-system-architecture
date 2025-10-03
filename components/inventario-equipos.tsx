"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { equipos, inventarioEquipos } from "@/lib/data"
import type { Tecnologia, Modelo } from "@/lib/types"
import { Pencil, Trash2 } from "lucide-react"

export function InventarioEquipos() {
  const [tecnologiaFiltro, setTecnologiaFiltro] = useState<Tecnologia | "Todas">("Todas")
  const [modeloFiltro, setModeloFiltro] = useState<Modelo | "Todos">("Todos")

  const equiposFiltrados = equipos.filter((e) => {
    const matchTecnologia = tecnologiaFiltro === "Todas" || e.tecnologia === tecnologiaFiltro
    const matchModelo = modeloFiltro === "Todos" || e.modelo === modeloFiltro
    return matchTecnologia && matchModelo
  })

  const getInventario = (equipoId: string) => {
    return inventarioEquipos.find((inv) => inv.productoId === equipoId)
  }

  const tecnologias: Array<{ id: Tecnologia | "Todas"; label: string; icon: string }> = [
    { id: "Todas", label: "Todas", icon: "🗂️" },
    { id: "Convencional", label: "Convencional", icon: "❄️" },
    { id: "Inverter", label: "Inverter", icon: "⚡" },
  ]

  const modelos: Array<{ id: Modelo | "Todos"; label: string; icon: string }> = [
    { id: "Todos", label: "Todos", icon: "🗂️" },
    { id: "LIFE12+", label: "LIFE12+", icon: "⚙️" },
    { id: "NEX 2023", label: "NEX 2023", icon: "⭐" },
    { id: "XLIFE", label: "XLIFE", icon: "💎" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black">Inventario de Equipos</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-black">Filtro por Tecnología</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {tecnologias.map((tec) => (
                <Button
                  key={tec.id}
                  onClick={() => setTecnologiaFiltro(tec.id)}
                  variant={tecnologiaFiltro === tec.id ? "default" : "outline"}
                  className={
                    tecnologiaFiltro === tec.id
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-white border-gray-300 text-black hover:bg-gray-50"
                  }
                >
                  <span className="mr-2">{tec.icon}</span>
                  {tec.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-black">Filtro por Modelo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {modelos.map((mod) => (
                <Button
                  key={mod.id}
                  onClick={() => setModeloFiltro(mod.id)}
                  variant={modeloFiltro === mod.id ? "default" : "outline"}
                  className={
                    modeloFiltro === mod.id
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-white border-gray-300 text-black hover:bg-gray-50"
                  }
                >
                  <span className="mr-2">{mod.icon}</span>
                  {mod.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-gray-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-gray-50">
                  <TableHead className="text-gray-700">SKU</TableHead>
                  <TableHead className="text-gray-700">Producto</TableHead>
                  <TableHead className="text-gray-700">Modelo</TableHead>
                  <TableHead className="text-gray-700">Tecnología</TableHead>
                  <TableHead className="text-gray-700 text-right">BTU</TableHead>
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
                {equiposFiltrados.map((equipo) => {
                  const inventario = getInventario(equipo.id)
                  const total = (inventario?.cantidadCancun || 0) + (inventario?.cantidadPlaya || 0)

                  return (
                    <TableRow key={equipo.id} className="border-gray-200 hover:bg-gray-50">
                      <TableCell className="font-mono text-blue-600">{equipo.sku}</TableCell>
                      <TableCell className="text-black font-medium">{equipo.nombre}</TableCell>
                      <TableCell className="text-gray-600">{equipo.modelo}</TableCell>
                      <TableCell className="text-gray-600">{equipo.tecnologia}</TableCell>
                      <TableCell className="text-right text-black">{equipo.btu.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-black">{inventario?.cantidadCancun || 0}</TableCell>
                      <TableCell className="text-right text-black">{inventario?.cantidadPlaya || 0}</TableCell>
                      <TableCell className="text-right text-black font-semibold">{total}</TableCell>
                      <TableCell className="text-right text-gray-600">${equipo.costo.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-black font-medium">${equipo.precio.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-green-600 font-semibold">
                        ${equipo.utilidad.toFixed(2)}
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
