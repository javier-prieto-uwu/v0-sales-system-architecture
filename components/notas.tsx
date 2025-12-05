"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Venta } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

// Tipo local para items de venta, alineado con historial-ventas
export type VentaItem = {
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

export function NotaVenta({ venta, items, onClose }: { venta: Venta; items: VentaItem[]; onClose?: () => void }) {
  const equipos = items.filter((i) => i.tipo === "equipo")
  const refacciones = items.filter((i) => i.tipo === "producto")

  const imprimir = () => {
    window.print()
  }

  return (
    <div id="nota-venta" className="space-y-4">
      <div className="flex items-center justify-between no-print">
        <h2 className="text-2xl font-bold text-black heading">Nota de Venta</h2>
        <div className="flex gap-2">
          <Button onClick={imprimir} className="bg-blue-600 hover:bg-blue-700 text-white">Exportar PDF</Button>
          {onClose && (
            <Button variant="outline" className="bg-white border-gray-300 text-black hover:bg-gray-50" onClick={onClose}>Cerrar</Button>
          )}
        </div>
      </div>

      {/* Encabezado con logo y datos de tienda */}
      <Card className="bg-white border-gray-200 card">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img src="/placeholder-logo.svg" alt="Logo" className="h-10 w-10" />
              <div>
                <div className="text-xl font-bold text-black">POS Mirage</div>
                <div className="text-sm text-gray-600">{venta.tienda}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Fecha</div>
              <div className="text-base text-black font-medium">{venta.fecha}</div>
              <div className="text-sm text-gray-600 mt-2">Nota</div>
              <div className="text-base text-blue-600 font-mono">{venta.nota_venta}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200 card">
        <CardHeader>
          <CardTitle className="text-black heading">Datos de la Venta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-3 text-sm small">
            <div className="space-y-1">
              <div className="text-gray-600">Cliente</div>
              <div className="text-black font-medium">{venta.cliente}</div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-600">Vendedor</div>
              <div className="text-black">{venta.vendedor}</div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-600">Factura</div>
              <div className="text-black">{venta.factura || "-"}</div>
            </div>
          </div>
          <div className="mt-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              {venta.metodo_pago}{venta.tipo_tarjeta ? ` (${venta.tipo_tarjeta})` : ""}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200 card">
        <CardHeader>
          <CardTitle className="text-black heading">Detalle de Productos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="compact min-w-full">
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-gray-50">
                  <TableHead className="text-gray-700">SKU</TableHead>
                  <TableHead className="text-gray-700">Nombre</TableHead>
                  <TableHead className="text-gray-700">Tipo</TableHead>
                  <TableHead className="text-gray-700 text-right">Cantidad</TableHead>
                  <TableHead className="text-gray-700 text-right">Precio Unit.</TableHead>
                  <TableHead className="text-gray-700 text-right">Total</TableHead>
                  <TableHead className="text-gray-700">Evaporador</TableHead>
                  <TableHead className="text-gray-700">Condensador</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it, idx) => (
                  <TableRow key={it.id} className={"border-gray-200 " + (idx % 2 === 0 ? "bg-white" : "bg-gray-50") }>
                    <TableCell className="font-mono text-blue-600 whitespace-nowrap">{it.sku}</TableCell>
                    <TableCell className="text-black">{it.nombre}</TableCell>
                    <TableCell className="text-gray-600 capitalize">{it.tipo}</TableCell>
                    <TableCell className="text-right text-black">{it.cantidad}</TableCell>
                    <TableCell className="text-right text-black">{formatCurrency(it.precio)}</TableCell>
                    <TableCell className="text-right text-black font-semibold">{formatCurrency(it.precio * it.cantidad)}</TableCell>
                    <TableCell className="text-gray-600 break-words">{it.tipo === "equipo" ? (it.numero_evaporador || "-") : "-"}</TableCell>
                    <TableCell className="text-gray-600 break-words">{it.tipo === "equipo" ? (it.numero_condensador || "-") : "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200 card">
        <CardHeader>
          <CardTitle className="text-black heading">Totales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-3 text-sm small">
            <div className="flex justify-between">
              <span className="text-gray-600">Costo Total:</span>
              <span className="text-gray-600">{formatCurrency(venta.costo_total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black font-bold">Total Venta:</span>
              <span className="text-black font-bold">{formatCurrency(venta.venta_total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Utilidad Total:</span>
              <span className="text-green-600 font-semibold">{formatCurrency(venta.utilidad_total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pie con firma */}
      <Card className="bg-white border-gray-200 card">
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-8 mt-2">
            <div>
              <div className="h-10 border-b border-gray-300"></div>
              <div className="text-xs text-gray-600 mt-1">Firma Cliente</div>
            </div>
            <div>
              <div className="h-10 border-b border-gray-300"></div>
              <div className="text-xs text-gray-600 mt-1">Firma Vendedor</div>
            </div>
          </div>
          <div className="text-center text-xs text-gray-500 mt-4">Gracias por su compra</div>
        </CardContent>
      </Card>

      <style jsx>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
          body * { visibility: hidden; }
          #nota-venta, #nota-venta * { visibility: visible; }
          #nota-venta {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
          }
          .no-print { display: none !important; }
          .card { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
          .heading { font-size: 18px !important; }
          .small { font-size: 12px !important; }
          .compact td, .compact th { padding: 4px 6px !important; font-size: 12px !important; }
          .compact { border-collapse: collapse; }
          .compact th, .compact td { border-bottom: 1px solid #e5e7eb; }
          .card { break-inside: avoid; }
        }
      `}</style>
    </div>
  )
}
