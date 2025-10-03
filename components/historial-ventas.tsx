"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ventasEjemplo } from "@/lib/data"
import type { Tienda } from "@/lib/types"
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

  const ventasFiltradas = useMemo(() => {
    if (filtroTienda === "Todas") return ventasEjemplo
    return ventasEjemplo.filter((v) => v.tienda === filtroTienda)
  }, [filtroTienda])

  const datosVentasPorVendedor = useMemo(() => {
    const ventasPorVendedor = new Map<string, { ventas: number; utilidad: number }>()

    ventasFiltradas.forEach((venta) => {
      const actual = ventasPorVendedor.get(venta.vendedor) || { ventas: 0, utilidad: 0 }
      ventasPorVendedor.set(venta.vendedor, {
        ventas: actual.ventas + venta.ventaTotal,
        utilidad: actual.utilidad + venta.utilidadTotal,
      })
    })

    return Array.from(ventasPorVendedor.entries()).map(([vendedor, datos]) => ({
      vendedor,
      ventas: datos.ventas,
      utilidad: datos.utilidad,
    }))
  }, [ventasFiltradas])

  const datosEquiposVsRefacciones = useMemo(() => {
    const totalEquipos = ventasFiltradas.reduce((sum, v) => sum + v.equiposVendidos, 0)
    const totalRefacciones = ventasFiltradas.reduce((sum, v) => sum + v.refaccionesVendidas, 0)

    return [
      { name: "Equipos", value: totalEquipos },
      { name: "Refacciones", value: totalRefacciones },
    ]
  }, [ventasFiltradas])

  const datosPorTienda = useMemo(() => {
    if (filtroTienda !== "Todas") return []

    const cancun = ventasEjemplo.filter((v) => v.tienda === "Cancún")
    const playa = ventasEjemplo.filter((v) => v.tienda === "Playa del Carmen")

    return [
      {
        tienda: "Cancún",
        ventas: cancun.reduce((sum, v) => sum + v.ventaTotal, 0),
        utilidad: cancun.reduce((sum, v) => sum + v.utilidadTotal, 0),
      },
      {
        tienda: "Playa",
        ventas: playa.reduce((sum, v) => sum + v.ventaTotal, 0),
        utilidad: playa.reduce((sum, v) => sum + v.utilidadTotal, 0),
      },
    ]
  }, [filtroTienda])

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
                    <TableCell className="text-blue-600 font-mono">{venta.notaVenta}</TableCell>
                    <TableCell className="text-gray-600">{venta.factura || "-"}</TableCell>
                    <TableCell className="text-black">{venta.cliente}</TableCell>
                    <TableCell className="text-black">{venta.vendedor}</TableCell>
                    <TableCell className="text-gray-600">{venta.tienda}</TableCell>
                    <TableCell className="text-gray-600">
                      {venta.metodoPago}
                      {venta.tipoTarjeta && ` (${venta.tipoTarjeta})`}
                    </TableCell>
                    <TableCell className="text-right text-gray-600">${venta.costoTotal.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-black font-medium">${venta.ventaTotal.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-green-600 font-semibold">
                      ${venta.utilidadTotal.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-black">{venta.equiposVendidos}</TableCell>
                    <TableCell className="text-right text-black">{venta.refaccionesVendidas}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-black">Ventas por Vendedor</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosVentasPorVendedor}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="vendedor" stroke="#374151" />
                <YAxis stroke="#374151" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                  labelStyle={{ color: "#000000" }}
                  itemStyle={{ color: "#2563eb" }}
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
                <YAxis stroke="#374151" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                  labelStyle={{ color: "#000000" }}
                  itemStyle={{ color: "#10b981" }}
                />
                <Legend wrapperStyle={{ color: "#374151" }} />
                <Bar dataKey="utilidad" fill="#10b981" name="Utilidad ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
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
                  <YAxis stroke="#374151" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                    labelStyle={{ color: "#000000" }}
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
