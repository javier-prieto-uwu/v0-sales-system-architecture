"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { vendedores, productos, equipos, inventarioProductos, inventarioEquipos } from "@/lib/data"
import type { Tienda, MetodoPago, TipoTarjeta, ItemCarrito } from "@/lib/types"
import { Trash2, ShoppingCart } from "lucide-react"

export function PuntoVenta() {
  const [tiendaVenta, setTiendaVenta] = useState<Tienda>("Cancún")
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState("")
  const [skuInput, setSkuInput] = useState("")
  const [cantidadInput, setCantidadInput] = useState("1")
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const [cliente, setCliente] = useState("")
  const [notaVenta, setNotaVenta] = useState("")
  const [factura, setFactura] = useState("")
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("Efectivo")
  const [tipoTarjeta, setTipoTarjeta] = useState<TipoTarjeta>("")

  const vendedoresFiltrados = vendedores.filter((v) => v.tienda === tiendaVenta)

  const buscarProducto = (sku: string) => {
    const producto = productos.find((p) => p.sku.toLowerCase() === sku.toLowerCase())
    if (producto) {
      return {
        id: producto.id,
        tipo: "producto" as const,
        sku: producto.sku,
        nombre: producto.nombre,
        costo: producto.costo,
        precio: producto.precio,
        utilidad: producto.utilidad,
      }
    }

    const equipo = equipos.find((e) => e.sku.toLowerCase() === sku.toLowerCase())
    if (equipo) {
      return {
        id: equipo.id,
        tipo: "equipo" as const,
        sku: equipo.sku,
        nombre: equipo.nombre,
        costo: equipo.costo,
        precio: equipo.precio,
        utilidad: equipo.utilidad,
      }
    }

    return null
  }

  const agregarAlCarrito = () => {
    if (!skuInput.trim()) return

    const item = buscarProducto(skuInput)
    if (!item) {
      alert("Producto no encontrado")
      return
    }

    const cantidad = Number.parseInt(cantidadInput) || 1

    const itemExistente = carrito.find((c) => c.sku === item.sku)
    if (itemExistente) {
      setCarrito(carrito.map((c) => (c.sku === item.sku ? { ...c, cantidad: c.cantidad + cantidad } : c)))
    } else {
      setCarrito([...carrito, { ...item, cantidad }])
    }

    setSkuInput("")
    setCantidadInput("1")
  }

  const eliminarDelCarrito = (sku: string) => {
    setCarrito(carrito.filter((item) => item.sku !== sku))
  }

  const calcularTotales = () => {
    const costoTotal = carrito.reduce((sum, item) => sum + item.costo * item.cantidad, 0)
    const ventaTotal = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
    const utilidadTotal = ventaTotal - costoTotal
    const equiposVendidos = carrito
      .filter((item) => item.tipo === "equipo")
      .reduce((sum, item) => sum + item.cantidad, 0)
    const refaccionesVendidas = carrito
      .filter((item) => item.tipo === "producto")
      .reduce((sum, item) => sum + item.cantidad, 0)

    return { costoTotal, ventaTotal, utilidadTotal, equiposVendidos, refaccionesVendidas }
  }

  const registrarVenta = () => {
    if (!vendedorSeleccionado) {
      alert("Selecciona un vendedor")
      return
    }

    if (carrito.length === 0) {
      alert("El carrito está vacío")
      return
    }

    const totales = calcularTotales()

    const venta = {
      id: Date.now().toString(),
      fecha: new Date().toISOString().split("T")[0],
      notaVenta,
      factura,
      cliente,
      vendedor: vendedorSeleccionado,
      tienda: tiendaVenta,
      metodoPago,
      tipoTarjeta,
      items: carrito,
      ...totales,
    }

    console.log("[v0] Venta registrada:", venta)

    // Descontar inventario
    carrito.forEach((item) => {
      if (item.tipo === "producto") {
        const inv = inventarioProductos.find((i) => i.productoId === item.id)
        if (inv) {
          if (tiendaVenta === "Cancún") {
            inv.cantidadCancun -= item.cantidad
          } else {
            inv.cantidadPlaya -= item.cantidad
          }
        }
      } else {
        const inv = inventarioEquipos.find((i) => i.productoId === item.id)
        if (inv) {
          if (tiendaVenta === "Cancún") {
            inv.cantidadCancun -= item.cantidad
          } else {
            inv.cantidadPlaya -= item.cantidad
          }
        }
      }
    })

    // Limpiar formulario
    setCarrito([])
    setCliente("")
    setNotaVenta("")
    setFactura("")
    setSkuInput("")
    setCantidadInput("1")

    alert("Venta registrada exitosamente")
  }

  const totales = calcularTotales()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black">Punto de Venta</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-black">Seleccionar Tienda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setTiendaVenta("Cancún")
                  setVendedorSeleccionado("")
                }}
                variant={tiendaVenta === "Cancún" ? "default" : "outline"}
                className={
                  tiendaVenta === "Cancún"
                    ? "bg-blue-600 hover:bg-blue-700 text-white flex-1"
                    : "bg-white border-gray-300 text-black hover:bg-gray-50 flex-1"
                }
              >
                Cancún
              </Button>
              <Button
                onClick={() => {
                  setTiendaVenta("Playa del Carmen")
                  setVendedorSeleccionado("")
                }}
                variant={tiendaVenta === "Playa del Carmen" ? "default" : "outline"}
                className={
                  tiendaVenta === "Playa del Carmen"
                    ? "bg-blue-600 hover:bg-blue-700 text-white flex-1"
                    : "bg-white border-gray-300 text-black hover:bg-gray-50 flex-1"
                }
              >
                Playa del Carmen
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-black">Seleccionar Vendedor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {vendedoresFiltrados.map((vendedor) => (
                <Button
                  key={vendedor.id}
                  onClick={() => setVendedorSeleccionado(vendedor.nombre)}
                  variant={vendedorSeleccionado === vendedor.nombre ? "default" : "outline"}
                  className={
                    vendedorSeleccionado === vendedor.nombre
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-white border-gray-300 text-black hover:bg-gray-50"
                  }
                >
                  {vendedor.nombre}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-black">Agregar Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="sku" className="text-black">
                SKU / Código de Barras
              </Label>
              <Input
                id="sku"
                value={skuInput}
                onChange={(e) => setSkuInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    agregarAlCarrito()
                  }
                }}
                placeholder="Escanear o escribir SKU"
                className="bg-white border-gray-300 text-black placeholder:text-gray-400"
              />
            </div>
            <div className="w-24">
              <Label htmlFor="cantidad" className="text-black">
                Cantidad
              </Label>
              <Input
                id="cantidad"
                type="number"
                min="1"
                value={cantidadInput}
                onChange={(e) => setCantidadInput(e.target.value)}
                className="bg-white border-gray-300 text-black"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={agregarAlCarrito} className="bg-blue-600 hover:bg-blue-700 text-white">
                Agregar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-black flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrito de Compras
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {carrito.length === 0 ? (
            <div className="p-8 text-center text-gray-500">El carrito está vacío</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 hover:bg-gray-50">
                    <TableHead className="text-gray-700">SKU</TableHead>
                    <TableHead className="text-gray-700">Producto</TableHead>
                    <TableHead className="text-gray-700">Tipo</TableHead>
                    <TableHead className="text-gray-700 text-right">Cantidad</TableHead>
                    <TableHead className="text-gray-700 text-right">Costo Unit.</TableHead>
                    <TableHead className="text-gray-700 text-right">Precio Unit.</TableHead>
                    <TableHead className="text-gray-700 text-right">Utilidad Unit.</TableHead>
                    <TableHead className="text-gray-700 text-right">Total</TableHead>
                    <TableHead className="text-gray-700 text-center">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carrito.map((item) => (
                    <TableRow key={item.sku} className="border-gray-200 hover:bg-gray-50">
                      <TableCell className="font-mono text-blue-600">{item.sku}</TableCell>
                      <TableCell className="text-black font-medium">{item.nombre}</TableCell>
                      <TableCell className="text-gray-600 capitalize">{item.tipo}</TableCell>
                      <TableCell className="text-right text-black">{item.cantidad}</TableCell>
                      <TableCell className="text-right text-gray-600">${item.costo.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-black">${item.precio.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-green-600">${item.utilidad.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-black font-semibold">
                        ${(item.precio * item.cantidad).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => eliminarDelCarrito(item.sku)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-gray-200 bg-gray-50">
                    <TableCell colSpan={7} className="text-right font-bold text-black">
                      Totales:
                    </TableCell>
                    <TableCell className="text-right font-bold text-black">${totales.ventaTotal.toFixed(2)}</TableCell>
                    <TableCell />
                  </TableRow>
                  <TableRow className="border-gray-200 bg-gray-50">
                    <TableCell colSpan={7} className="text-right text-gray-600">
                      Costo Total:
                    </TableCell>
                    <TableCell className="text-right text-gray-600">${totales.costoTotal.toFixed(2)}</TableCell>
                    <TableCell />
                  </TableRow>
                  <TableRow className="border-gray-200 bg-gray-50">
                    <TableCell colSpan={7} className="text-right text-gray-600">
                      Utilidad Total:
                    </TableCell>
                    <TableCell className="text-right text-green-600 font-semibold">
                      ${totales.utilidadTotal.toFixed(2)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-black">Información de la Venta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cliente" className="text-black">
                Cliente
              </Label>
              <Input
                id="cliente"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Nombre del cliente"
                className="bg-white border-gray-300 text-black placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notaVenta" className="text-black">
                Nota de Venta
              </Label>
              <Input
                id="notaVenta"
                value={notaVenta}
                onChange={(e) => setNotaVenta(e.target.value)}
                placeholder="NV-001"
                className="bg-white border-gray-300 text-black placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="factura" className="text-black">
                Número de Factura
              </Label>
              <Input
                id="factura"
                value={factura}
                onChange={(e) => setFactura(e.target.value)}
                placeholder="F-001 (opcional)"
                className="bg-white border-gray-300 text-black placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="metodoPago" className="text-black">
                Método de Pago
              </Label>
              <Select value={metodoPago} onValueChange={(value) => setMetodoPago(value as MetodoPago)}>
                <SelectTrigger className="bg-white border-gray-300 text-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="Efectivo" className="text-black">
                    Efectivo
                  </SelectItem>
                  <SelectItem value="Tarjeta" className="text-black">
                    Tarjeta
                  </SelectItem>
                  <SelectItem value="Transferencia" className="text-black">
                    Transferencia
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {metodoPago === "Tarjeta" && (
              <div className="space-y-2">
                <Label htmlFor="tipoTarjeta" className="text-black">
                  Tipo de Tarjeta
                </Label>
                <Select value={tipoTarjeta} onValueChange={(value) => setTipoTarjeta(value as TipoTarjeta)}>
                  <SelectTrigger className="bg-white border-gray-300 text-black">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="Débito" className="text-black">
                      Débito
                    </SelectItem>
                    <SelectItem value="Crédito" className="text-black">
                      Crédito
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="pt-4">
            <Button onClick={registrarVenta} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6">
              Registrar Venta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
