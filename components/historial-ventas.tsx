"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Tienda, Venta } from "@/lib/types"
import { supabase } from "@/lib/supabaseClient"
import { formatCurrency } from "@/lib/utils"
import { Trash2 } from "lucide-react"
import { NotaVenta } from "@/components/notas"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export function HistorialVentas() {
  const [filtroTienda, setFiltroTienda] = useState<Tienda | "Todas">("Todas")
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const ahora = new Date()
  const mesActual = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}`
  const [mesSeleccionado, setMesSeleccionado] = useState<string>(mesActual)
  const [busqueda, setBusqueda] = useState<string>("")
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null)
  const [mostrarNota, setMostrarNota] = useState(false)

  // Detalle de items por venta
  type VentaItem = {
    id: string
    venta_id: string
    tipo: "producto" | "equipo"
    producto_id: string
    sku: string
    nombre: string
    cantidad: number
    costo: number
    precio: number
    utilidad: number
    numero_evaporador?: string | null
    numero_condensador?: string | null
    created_at?: string
  }
  const [itemsPorVenta, setItemsPorVenta] = useState<Record<string, VentaItem[]>>({})
  const [itemsLoading, setItemsLoading] = useState(false)
  const [itemsError, setItemsError] = useState<string | null>(null)

  // Función para cargar ventas desde Supabase
  const cargarVentas = async (tienda?: Tienda | "Todas") => {
    try {
      setLoading(true)
      setError(null)
      
      let query = supabase
        .from("ventas")
        .select("*")
        .order("created_at", { ascending: false })
      
      // Aplicar filtro de tienda si es necesario
      if (tienda && tienda !== "Todas") {
        query = query.eq("tienda", tienda)
      }

      // Filtrar por mes seleccionado (rango de fechas)
      if (mesSeleccionado) {
        const start = new Date(`${mesSeleccionado}-01T00:00:00`)
        const end = new Date(start)
        end.setMonth(end.getMonth() + 1)
        const startISO = start.toISOString()
        const endISO = end.toISOString()
        query = query.gte("fecha", startISO).lt("fecha", endISO)
      }
      
      const { data: baseData, error: baseError } = await query
      
      if (baseError) {
        console.error("Error cargando ventas:", baseError.message)
        throw new Error(`Error al cargar ventas: ${baseError.message}`)
      }
      const ventasBase: Venta[] = (baseData || []).map((row: any) => ({
        id: row.id,
        fecha: row.fecha,
        nota_venta: row.nota_venta,
        factura: row.factura,
        cliente: row.cliente,
        vendedor: row.vendedor,
        tienda: row.tienda as Tienda,
        metodo_pago: row.metodo_pago,
        tipo_tarjeta: row.tipo_tarjeta,
        costo_total: Number(row.costo_total || 0),
        venta_total: Number(row.venta_total || 0),
        utilidad_total: Number(row.utilidad_total || 0),
        equipos_vendidos: Number(row.equipos_vendidos || 0),
        refacciones_vendidas: Number(row.refacciones_vendidas || 0),
      }))
      
      // Si no hay búsqueda, usar ventas base
      if (!busqueda || busqueda.trim() === "") {
        setVentas(ventasBase)
      } else {
        const term = busqueda.trim()
        const pattern = `%${term}%`

        // Buscar en ventas por cliente/nota/factura/vendedor
        let ventasQuery = supabase
          .from("ventas")
          .select("*")
          .order("created_at", { ascending: false })
        if (tienda && tienda !== "Todas") ventasQuery = ventasQuery.eq("tienda", tienda)
        if (mesSeleccionado) {
          const start = new Date(`${mesSeleccionado}-01T00:00:00`).toISOString()
          const end = new Date(`${mesSeleccionado}-01T00:00:00`)
          end.setMonth(end.getMonth() + 1)
          const endISO = end.toISOString()
          ventasQuery = ventasQuery.gte("fecha", start).lt("fecha", endISO)
        }
        ventasQuery = ventasQuery.or(
          `cliente.ilike.${pattern},nota_venta.ilike.${pattern},vendedor.ilike.${pattern},factura.ilike.${pattern}`
        );
        const { data: ventasMatch, error: ventasMatchError } = await ventasQuery
        if (ventasMatchError) throw new Error(ventasMatchError.message)

        const baseIds = new Set(ventasBase.map((v) => v.id))

        // Buscar serial en venta_items acotado a ventas base
        const { data: itemsMatch, error: itemsMatchError } = await supabase
          .from("venta_items")
          .select("venta_id")
          .in("venta_id", Array.from(baseIds))
          .or(`numero_evaporador.ilike.${pattern},numero_condensador.ilike.${pattern}`);
        if (itemsMatchError) throw new Error(itemsMatchError.message)

        const matchIds = new Set<string>();
        const ventasRows: any[] = Array.isArray(ventasMatch) ? (ventasMatch as any[]) : [];
        ventasRows.forEach((row: any) => matchIds.add(row.id));
        const itemsRows: any[] = Array.isArray(itemsMatch) ? (itemsMatch as any[]) : [];
        itemsRows.forEach((row: any) => matchIds.add(row.venta_id));

        const filtradas = ventasBase.filter((v) => matchIds.has(v.id))
        setVentas(filtradas)
      }
    } catch (err) {
      console.error('Error cargando ventas:', err)
      setError('Error al cargar las ventas')
    } finally {
      setLoading(false)
    }
  }

  // Cargar ventas al montar el componente
  useEffect(() => {
    cargarVentas(filtroTienda)
  }, [])

  // Recargar ventas cuando cambie el filtro de tienda
  useEffect(() => {
    cargarVentas(filtroTienda)
  }, [filtroTienda, mesSeleccionado])

  const buscar = () => {
    cargarVentas(filtroTienda)
  }

  // Cargar items de ventas cuando haya ventas
  useEffect(() => {
    const cargarItemsDeVentas = async () => {
      try {
        setItemsError(null)
        setItemsLoading(true)

        if (!ventas || ventas.length === 0) {
          setItemsPorVenta({})
          return
        }

        const ventaIds = ventas.map((v) => v.id)
        const { data, error } = await supabase
          .from("venta_items")
          .select("*")
          .in("venta_id", ventaIds)

        if (error) {
          throw new Error(error.message)
        }

        const map: Record<string, VentaItem[]> = {}
        const rows: any[] = Array.isArray(data) ? (data as any[]) : []
        rows.forEach((item: any) => {
          const key = item.venta_id as string
          if (!map[key]) map[key] = []
          map[key].push({
            id: item.id,
            venta_id: item.venta_id,
            tipo: item.tipo,
            producto_id: item.producto_id,
            sku: item.sku,
            nombre: item.nombre,
            cantidad: Number(item.cantidad ?? 0),
            costo: Number(item.costo ?? 0),
            precio: Number(item.precio ?? 0),
            utilidad: Number(item.utilidad ?? 0),
            numero_evaporador: item.numero_evaporador ?? null,
            numero_condensador: item.numero_condensador ?? null,
            created_at: item.created_at,
          })
        })

        setItemsPorVenta(map)
      } catch (err) {
        console.error("Error cargando items de ventas:", err)
        setItemsError("No se pudieron cargar los detalles de las ventas")
      } finally {
        setItemsLoading(false)
      }
    }

    if (!loading && !error) {
      cargarItemsDeVentas()
    }
  }, [ventas, loading, error])

  // Eliminar una venta por id
  const deleteVenta = async (id: string) => {
    const confirmar = window.confirm("¿Eliminar esta venta? Esta acción no se puede deshacer.")
    if (!confirmar) return
    try {
      setDeletingId(id)
      const { error } = await supabase.from("ventas").delete().eq("id", id)
      if (error) {
        throw new Error(error.message)
      }
      // Actualizar estado local
      setVentas((prev) => prev.filter((v) => v.id !== id))
    } catch (err) {
      console.error("Error eliminando venta:", err)
      setError("No se pudo eliminar la venta")
    } finally {
      setDeletingId(null)
    }
  }

  const ventasFiltradas = useMemo(() => {
    return ventas // Ya están filtradas por la consulta de Supabase
  }, [ventas])

  const datosVentasPorVendedor = useMemo(() => {
    const ventasPorVendedor = new Map<string, { ventas: number; utilidad: number }>()

    ventasFiltradas.forEach((venta) => {
      const actual = ventasPorVendedor.get(venta.vendedor) || { ventas: 0, utilidad: 0 }
      ventasPorVendedor.set(venta.vendedor, {
        ventas: actual.ventas + venta.venta_total,
        utilidad: actual.utilidad + venta.utilidad_total,
      })
    })

    return Array.from(ventasPorVendedor.entries()).map(([vendedor, datos]) => ({
      vendedor,
      ventas: datos.ventas,
      utilidad: datos.utilidad,
    }))
  }, [ventasFiltradas])

  const datosEquiposVsRefacciones = useMemo(() => {
    const totalEquipos = ventasFiltradas.reduce((sum, v) => sum + v.equipos_vendidos, 0)
    const totalRefacciones = ventasFiltradas.reduce((sum, v) => sum + v.refacciones_vendidas, 0)

    return [
      { name: "Equipos", value: totalEquipos },
      { name: "Refacciones", value: totalRefacciones },
    ]
  }, [ventasFiltradas])

  const datosPorTienda = useMemo(() => {
    if (filtroTienda !== "Todas") return []

    const cancun = ventas.filter((v) => v.tienda === "Cancún")
    const playa = ventas.filter((v) => v.tienda === "Playa del Carmen")

    return [
      {
        tienda: "Cancún",
        ventas: cancun.reduce((sum, v) => sum + v.venta_total, 0),
        utilidad: cancun.reduce((sum, v) => sum + v.utilidad_total, 0),
      },
      {
        tienda: "Playa",
        ventas: playa.reduce((sum, v) => sum + v.venta_total, 0),
        utilidad: playa.reduce((sum, v) => sum + v.utilidad_total, 0),
      },
    ]
  }, [ventas, filtroTienda])

  const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black">Historial de Ventas</h1>
      </div>

      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-black">Filtrar por Tienda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <Button
              onClick={() => setFiltroTienda("Todas")}
              variant={filtroTienda === "Todas" ? "default" : "outline"}
              className={
                filtroTienda === "Todas"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-white border-gray-300 text-black hover:bg-gray-50"
              }
            >
              Todas las Tiendas
            </Button>
            <Button
              onClick={() => setFiltroTienda("Cancún")}
              variant={filtroTienda === "Cancún" ? "default" : "outline"}
              className={
                filtroTienda === "Cancún"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-white border-gray-300 text-black hover:bg-gray-50"
              }
            >
              Cancún
            </Button>
            <Button
              onClick={() => setFiltroTienda("Playa del Carmen")}
              variant={filtroTienda === "Playa del Carmen" ? "default" : "outline"}
              className={
                filtroTienda === "Playa del Carmen"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-white border-gray-300 text-black hover:bg-gray-50"
              }
            >
              Playa del Carmen
            </Button>

            <div className="flex items-center gap-2 md:ml-auto">
              <Input
                type="month"
                value={mesSeleccionado}
                onChange={(e) => setMesSeleccionado(e.target.value)}
                className="w-[160px]"
                aria-label="Seleccionar mes"
              />
              <Input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar: cliente, nota, serie"
                aria-label="Buscar ventas"
                className="w-[240px]"
              />
              <Button onClick={buscar} className="bg-blue-600 hover:bg-blue-700 text-white">Buscar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-black">Tabla de Ventas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && (
            <div className="p-8 text-center text-gray-500">
              Cargando ventas...
            </div>
          )}
          {error && (
            <div className="p-8 text-center text-red-500">
              {error}
            </div>
          )}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                <TableRow className="border-gray-200 hover:bg-gray-50">
                  <TableHead className="text-gray-700">Fecha</TableHead>
                  <TableHead className="text-gray-700">Nota</TableHead>
                  <TableHead className="text-gray-700">Factura</TableHead>
                  <TableHead className="text-gray-700">Cliente</TableHead>
                  <TableHead className="text-gray-700">Vendedor</TableHead>
                  <TableHead className="text-gray-700">Tienda</TableHead>
                  <TableHead className="text-gray-700">Método Pago</TableHead>
                  <TableHead className="text-gray-700 text-right">Costo</TableHead>
                  <TableHead className="text-gray-700 text-right">Venta</TableHead>
                  <TableHead className="text-gray-700 text-right">Utilidad</TableHead>
                  <TableHead className="text-gray-700 text-right">Equipos</TableHead>
                  <TableHead className="text-gray-700 text-right">Refacciones</TableHead>
                  <TableHead className="text-gray-700 text-center">Acciones</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {ventasFiltradas.map((venta) => (
                  <>
                    <TableRow key={venta.id} className="border-gray-200 hover:bg-gray-50">
                      <TableCell className="text-gray-600">{venta.fecha}</TableCell>
                      <TableCell className="text-blue-600 font-mono">{venta.nota_venta}</TableCell>
                      <TableCell className="text-gray-600">{venta.factura || "-"}</TableCell>
                      <TableCell className="text-black">{venta.cliente}</TableCell>
                      <TableCell className="text-black">{venta.vendedor}</TableCell>
                      <TableCell className="text-gray-600">{venta.tienda}</TableCell>
                      <TableCell className="text-gray-600">
                        {venta.metodo_pago}
                        {venta.tipo_tarjeta && ` (${venta.tipo_tarjeta})`}
                      </TableCell>
                      <TableCell className="text-right text-gray-600">{formatCurrency(venta.costo_total)}</TableCell>
                      <TableCell className="text-right text-black font-medium">{formatCurrency(venta.venta_total)}</TableCell>
                      <TableCell className="text-right text-green-600 font-semibold">
                        {formatCurrency(venta.utilidad_total)}
                      </TableCell>
                      <TableCell className="text-right text-black">{venta.equipos_vendidos}</TableCell>
                      <TableCell className="text-right text-black">{venta.refacciones_vendidas}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white border-gray-300 text-black hover:bg-gray-50"
                            onClick={() => { setVentaSeleccionada(venta); setMostrarNota(true); }}
                            aria-label="Ver nota de venta"
                          >
                            Ver Nota
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => deleteVenta(venta.id)}
                            disabled={deletingId === venta.id}
                            aria-label="Eliminar venta"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-gray-50 border-gray-200">
                      <TableCell colSpan={13} className="p-4">
                        {itemsLoading && (
                          <div className="text-sm text-gray-500">Cargando detalles...</div>
                        )}
                        {itemsError && (
                          <div className="text-sm text-red-600">{itemsError}</div>
                        )}
                        {!itemsLoading && !itemsError && (
                          <div className="space-y-2">
                            <div className="text-sm text-gray-700 font-semibold">Detalles de la venta</div>
                            {(() => {
                              const items = itemsPorVenta[venta.id] || []
                              if (!items.length) {
                                return (
                                  <div className="text-sm text-gray-500">Sin detalles de items.</div>
                                )
                              }

                              const equipos = items.filter((i) => i.tipo === "equipo")
                              const refacciones = items.filter((i) => i.tipo === "producto")

                              return (
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-sm text-gray-600 font-medium mb-1">Equipos</div>
                                    {equipos.length === 0 ? (
                                      <div className="text-sm text-gray-500">Sin equipos</div>
                                    ) : (
                                      <ul className="space-y-1">
                                        {equipos.map((eq) => (
                                          <li key={eq.id} className="text-sm text-black">
                                            <span className="font-medium">{eq.nombre}</span>{" "}
                                            <span className="text-gray-600">(SKU: {eq.sku})</span>{" "}
                                            <span className="text-gray-600">x{eq.cantidad}</span>
                                            <div className="text-xs text-gray-600 ml-1">
                                              Serie Evaporador: {eq.numero_evaporador || "-"} · Serie Condensador: {eq.numero_condensador || "-"}
                                            </div>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-600 font-medium mb-1">Refacciones</div>
                                    {refacciones.length === 0 ? (
                                      <div className="text-sm text-gray-500">Sin refacciones</div>
                                    ) : (
                                      <ul className="space-y-1">
                                        {refacciones.map((rf) => (
                                          <li key={rf.id} className="text-sm text-black">
                                            <span className="font-medium">{rf.nombre}</span>{" "}
                                            <span className="text-gray-600">(SKU: {rf.sku})</span>{" "}
                                            <span className="text-gray-600">x{rf.cantidad}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                </div>
                              )
                            })()}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  </>
                ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Nota de Venta */}
      {mostrarNota && ventaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto">
            <div className="flex justify-end p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMostrarNota(false)}
                className="text-gray-600 hover:bg-gray-100"
                aria-label="Cerrar"
              >
                Cerrar
              </Button>
            </div>
            <div className="p-4">
              <NotaVenta
                venta={ventaSeleccionada}
                items={itemsPorVenta[ventaSeleccionada.id] || []}
                onClose={() => setMostrarNota(false)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-black">Ventas por Vendedor</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosVentasPorVendedor}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="vendedor" stroke="#374151" />
                <YAxis stroke="#374151" tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                  labelStyle={{ color: "#000000" }}
                  itemStyle={{ color: "#2563eb" }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend wrapperStyle={{ color: "#374151" }} />
                <Bar dataKey="ventas" fill="#2563eb" name="Ventas ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-black">Utilidad por Vendedor</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosVentasPorVendedor}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="vendedor" stroke="#374151" />
                <YAxis stroke="#374151" tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                  labelStyle={{ color: "#000000" }}
                  itemStyle={{ color: "#10b981" }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend wrapperStyle={{ color: "#374151" }} />
                <Bar dataKey="utilidad" fill="#10b981" name="Utilidad ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-black">Equipos vs Refacciones</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={datosEquiposVsRefacciones}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {datosEquiposVsRefacciones.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                  itemStyle={{ color: "#000000" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {filtroTienda === "Todas" && datosPorTienda.length > 0 && (
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-black">Comparación por Tienda</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={datosPorTienda}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="tienda" stroke="#374151" />
                  <YAxis stroke="#374151" tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                    labelStyle={{ color: "#000000" }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend wrapperStyle={{ color: "#374151" }} />
                  <Bar dataKey="ventas" fill="#2563eb" name="Ventas ($)" />
                  <Bar dataKey="utilidad" fill="#10b981" name="Utilidad ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
