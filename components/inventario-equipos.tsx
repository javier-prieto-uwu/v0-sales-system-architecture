"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Tecnologia, Modelo, Equipo, InventarioItem } from "@/lib/types"
import { Pencil, Trash2, Folder, Snowflake, Zap, Cog, Star, Gem } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { formatCurrency } from "@/lib/utils"

export function InventarioEquipos() {
  const [equiposState, setEquiposState] = useState<Equipo[]>([])
  const [inventarioState, setInventarioState] = useState<InventarioItem[]>([])
  const [tecnologiaFiltro, setTecnologiaFiltro] = useState<Tecnologia | "Todas">("Todas")
  const [modeloFiltro, setModeloFiltro] = useState<Modelo | "Todos">("Todos")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ costo: number; precio: number; cantidadCancun: number; cantidadPlaya: number }>({
    costo: 0,
    precio: 0,
    cantidadCancun: 0,
    cantidadPlaya: 0,
  })
  const [loading, setLoading] = useState(false)
  const [modelosList, setModelosList] = useState<string[]>([])

  useEffect(() => {
    const loadEquipos = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("equipos")
        .select("id, sku, nombre, modelo, tecnologia, btu, voltaje, costo, precio, cantidad_cancun, cantidad_playa")
        .order("nombre", { ascending: true })

      if (error) {
        console.error("Error cargando equipos:", error.message)
        setLoading(false)
        return
      }

      const equipos: Equipo[] = (data || []).map((row: any) => ({
        id: row.id,
        sku: row.sku ?? "",
        nombre: row.nombre,
        modelo: row.modelo as Modelo,
        tecnologia: row.tecnologia as Tecnologia,
        btu: Number(row.btu ?? 0),
        voltaje: Number(row.voltaje ?? 0),
        costo: Number(row.costo ?? 0),
        precio: Number(row.precio ?? 0),
        utilidad: Number(row.precio ?? 0) - Number(row.costo ?? 0),
      }))

      const inventario: InventarioItem[] = (data || []).map((row: any) => ({
        productoId: row.id,
        cantidadCancun: Number(row.cantidad_cancun ?? 0),
        cantidadPlaya: Number(row.cantidad_playa ?? 0),
      }))

      setEquiposState(equipos)
      setInventarioState(inventario)
      setLoading(false)
    }

    loadEquipos()
  }, [])

  // Cargar modelos desde catálogo (public.catalogo_modelos)
  useEffect(() => {
    const loadModelos = async () => {
      const { data, error } = await supabase.from("catalogo_modelos").select("nombre")
      if (error) {
        console.error("Error cargando modelos:", error.message)
        return
      }
      const fetched = (data || []).map((d: any) => d.nombre).filter(Boolean)
      setModelosList(fetched)
    }
    loadModelos()
  }, [])

  const equiposFiltrados = equiposState.filter((e) => {
    const matchTecnologia = tecnologiaFiltro === "Todas" || e.tecnologia === tecnologiaFiltro
    const matchModelo = modeloFiltro === "Todos" || e.modelo === modeloFiltro
    return matchTecnologia && matchModelo
  })

  const getInventario = (equipoId: string) => {
    return inventarioState.find((inv) => inv.productoId === equipoId)
  }

  const tecnologias: Array<{ id: Tecnologia | "Todas"; label: string; icon: React.ElementType }> = [
    { id: "Todas", label: "Todas", icon: Folder },
    { id: "Convencional", label: "Convencional", icon: Snowflake },
    { id: "Inverter", label: "Inverter", icon: Zap },
  ]

  const modelos: Array<{ id: Modelo | "Todos"; label: string; icon: React.ElementType }> = [
    { id: "Todos", label: "Todos", icon: Folder },
    ...modelosList.map((modelo) => ({
      id: modelo as Modelo,
      label: modelo,
      icon: Cog, // Usar un icono por defecto para todos los modelos dinámicos
    })),
  ]

  const deleteEquipo = async (equipoId: string) => {
    const equipo = equiposState.find((e) => e.id === equipoId)
    const nombre = equipo?.nombre ?? equipoId
    if (typeof window !== "undefined") {
      const ok = window.confirm(`¿Eliminar el equipo "${nombre}" y su inventario asociado?`)
      if (!ok) return
    }

    const { error } = await supabase.from("equipos").delete().eq("id", equipoId)
    if (error) {
      console.error("Error eliminando equipo:", error.message)
      if (typeof window !== "undefined") alert("Error al eliminar en la base de datos")
      return
    }

    setEquiposState((prev) => prev.filter((e) => e.id !== equipoId))
    setInventarioState((prev) => prev.filter((i) => i.productoId !== equipoId))
  }

  const startEdit = (equipo: Equipo) => {
    const inv = getInventario(equipo.id)
    setEditingId(equipo.id)
    setEditValues({
      costo: equipo.costo,
      precio: equipo.precio,
      cantidadCancun: inv?.cantidadCancun ?? 0,
      cantidadPlaya: inv?.cantidadPlaya ?? 0,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = async (equipoId: string) => {
    const { error } = await supabase
      .from("equipos")
      .update({
        costo: editValues.costo,
        precio: editValues.precio,
        cantidad_cancun: editValues.cantidadCancun,
        cantidad_playa: editValues.cantidadPlaya,
      })
      .eq("id", equipoId)

    if (error) {
      console.error("Error actualizando equipo:", error.message)
      if (typeof window !== "undefined") alert("Error al guardar cambios en la base de datos")
      return
    }

    setEquiposState((prev) =>
      prev.map((e) =>
        e.id === equipoId
          ? { ...e, costo: editValues.costo, precio: editValues.precio, utilidad: editValues.precio - editValues.costo }
          : e
      )
    )

    setInventarioState((prev) => {
      const exists = prev.some((i) => i.productoId === equipoId)
      if (exists) {
        return prev.map((i) =>
          i.productoId === equipoId
            ? { ...i, cantidadCancun: editValues.cantidadCancun, cantidadPlaya: editValues.cantidadPlaya }
            : i
        )
      }
      return [
        ...prev,
        { productoId: equipoId, cantidadCancun: editValues.cantidadCancun, cantidadPlaya: editValues.cantidadPlaya } as InventarioItem,
      ]
    })

    setEditingId(null)
    if (typeof window !== "undefined") alert("Cambios guardados en la base de datos")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black">Inventario de Equipos</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
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
                  {(() => {
                    const Icon = tec.icon
                    return <Icon className="h-4 w-4 mr-2" aria-hidden="true" />
                  })()}
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
                  {(() => {
                    const Icon = mod.icon
                    return <Icon className="h-4 w-4 mr-2" aria-hidden="true" />
                  })()}
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
                  <TableHead className="text-gray-700 text-right">Voltaje</TableHead>
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
                  const utilidadCalc = equipo.precio - equipo.costo

                  return (
                    <TableRow key={equipo.id} className="border-gray-200 hover:bg-gray-50">
                      <TableCell className="font-mono text-blue-600">{equipo.sku}</TableCell>
                      <TableCell className="text-black font-medium">{equipo.nombre}</TableCell>
                      <TableCell className="text-gray-600">{equipo.modelo}</TableCell>
                      <TableCell className="text-gray-600">{equipo.tecnologia}</TableCell>
                      <TableCell className="text-right text-black">{equipo.btu.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-black">{equipo.voltaje}</TableCell>
                      <TableCell className="text-right text-black">
                        {editingId === equipo.id ? (
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
                        {editingId === equipo.id ? (
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
                        {editingId === equipo.id ? (
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
                          <>{formatCurrency(equipo.costo)}</>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-black font-medium">
                        {editingId === equipo.id ? (
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
                          <>{formatCurrency(equipo.precio)}</>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-semibold">
                        {formatCurrency(utilidadCalc)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          {editingId === equipo.id ? (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => saveEdit(equipo.id)}
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
                                onClick={() => startEdit(equipo)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => deleteEquipo(equipo.id)}
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
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
