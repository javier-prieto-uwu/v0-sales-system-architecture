"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Tienda, Venta } from "@/lib/types"
import { supabase } from "@/lib/supabaseClient"
import { formatCurrency } from "@/lib/utils"
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
      
      const { data, error } = await query
      
      if (error) {
        console.error("Error cargando ventas:", error.message)
        throw new Error(`Error al cargar ventas: ${error.message}`)
      }
      
      // Mapear los datos a la estructura esperada
      const ventasData: Venta[] = (data || []).map((row: any) => ({
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
      
      setVentas(ventasData)
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
  }, [filtroTienda])

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
          <div className="flex gap-2">
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
                </TableRow>
                </TableHeader>
                <TableBody>
                {ventasFiltradas.map((venta) => (
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
                  </TableRow>
                ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

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
