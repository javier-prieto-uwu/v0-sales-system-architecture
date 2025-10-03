"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Categoria, Modelo, Tecnologia, Tienda } from "@/lib/types"

export function AgregarProducto() {
  const [tipoInventario, setTipoInventario] = useState<"normal" | "equipo">("normal")
  const [sku, setSku] = useState("")
  const [nombre, setNombre] = useState("")
  const [categoria, setCategoria] = useState<Categoria>("Controles")
  const [modelo, setModelo] = useState<Modelo>("LIFE12+")
  const [tecnologia, setTecnologia] = useState<Tecnologia>("Convencional")
  const [btu, setBtu] = useState("")
  const [voltaje, setVoltaje] = useState("")
  const [cantidadCancun, setCantidadCancun] = useState("")
  const [cantidadPlaya, setCantidadPlaya] = useState("")
  const [costo, setCosto] = useState("")
  const [precio, setPrecio] = useState("")
  const [utilidad, setUtilidad] = useState("")
  const [ubicacionPrincipal, setUbicacionPrincipal] = useState<Tienda>("Cancún")

  const calcularUtilidad = () => {
    const costoNum = Number.parseFloat(costo) || 0
    const precioNum = Number.parseFloat(precio) || 0
    const utilidadCalculada = precioNum - costoNum
    setUtilidad(utilidadCalculada.toFixed(2))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Producto agregado:", {
      tipo: tipoInventario,
      sku,
      nombre,
      categoria: tipoInventario === "normal" ? categoria : undefined,
      modelo: tipoInventario === "equipo" ? modelo : undefined,
      tecnologia: tipoInventario === "equipo" ? tecnologia : undefined,
      btu: tipoInventario === "equipo" ? btu : undefined,
      voltaje: tipoInventario === "equipo" ? voltaje : undefined,
      cantidadCancun,
      cantidadPlaya,
      costo,
      precio,
      utilidad,
      ubicacionPrincipal,
    })
    // Reset form
    setSku("")
    setNombre("")
    setCantidadCancun("")
    setCantidadPlaya("")
    setCosto("")
    setPrecio("")
    setUtilidad("")
    setBtu("")
    setVoltaje("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black">Agregar Producto</h1>
      </div>

      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-black">Tipo de Inventario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={() => setTipoInventario("normal")}
              variant={tipoInventario === "normal" ? "default" : "outline"}
              className={
                tipoInventario === "normal"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-white border-gray-300 text-black hover:bg-gray-50"
              }
            >
              Normal (Refacciones)
            </Button>
            <Button
              onClick={() => setTipoInventario("equipo")}
              variant={tipoInventario === "equipo" ? "default" : "outline"}
              className={
                tipoInventario === "equipo"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-white border-gray-300 text-black hover:bg-gray-50"
              }
            >
              Equipos
            </Button>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-black">Información del Producto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku" className="text-black">
                  SKU
                </Label>
                <Input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Ej: MRC4K2E"
                  className="bg-white border-gray-300 text-black placeholder:text-gray-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-black">
                  Nombre del Producto
                </Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Control Remoto Universal"
                  className="bg-white border-gray-300 text-black placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            {tipoInventario === "normal" && (
              <div className="space-y-2">
                <Label htmlFor="categoria" className="text-black">
                  Categoría
                </Label>
                <Select value={categoria} onValueChange={(value) => setCategoria(value as Categoria)}>
                  <SelectTrigger className="bg-white border-gray-300 text-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="Controles" className="text-black">
                      Controles
                    </SelectItem>
                    <SelectItem value="Misceláneos" className="text-black">
                      Misceláneos
                    </SelectItem>
                    <SelectItem value="Motores de Evaporador" className="text-black">
                      Motores de Evaporador
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {tipoInventario === "equipo" && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="modelo" className="text-black">
                      Modelo
                    </Label>
                    <Select value={modelo} onValueChange={(value) => setModelo(value as Modelo)}>
                      <SelectTrigger className="bg-white border-gray-300 text-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        <SelectItem value="LIFE12+" className="text-black">
                          LIFE12+
                        </SelectItem>
                        <SelectItem value="NEX 2023" className="text-black">
                          NEX 2023
                        </SelectItem>
                        <SelectItem value="XLIFE" className="text-black">
                          XLIFE
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tecnologia" className="text-black">
                      Tecnología
                    </Label>
                    <Select value={tecnologia} onValueChange={(value) => setTecnologia(value as Tecnologia)}>
                      <SelectTrigger className="bg-white border-gray-300 text-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        <SelectItem value="Convencional" className="text-black">
                          Convencional
                        </SelectItem>
                        <SelectItem value="Inverter" className="text-black">
                          Inverter
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="btu" className="text-black">
                      BTU
                    </Label>
                    <Input
                      id="btu"
                      type="number"
                      value={btu}
                      onChange={(e) => setBtu(e.target.value)}
                      placeholder="Ej: 12000"
                      className="bg-white border-gray-300 text-black placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="voltaje" className="text-black">
                      Voltaje
                    </Label>
                    <Input
                      id="voltaje"
                      type="number"
                      value={voltaje}
                      onChange={(e) => setVoltaje(e.target.value)}
                      placeholder="Ej: 115 o 220"
                      className="bg-white border-gray-300 text-black placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cantidadCancun" className="text-black">
                  Cantidad Cancún
                </Label>
                <Input
                  id="cantidadCancun"
                  type="number"
                  value={cantidadCancun}
                  onChange={(e) => setCantidadCancun(e.target.value)}
                  placeholder="0"
                  className="bg-white border-gray-300 text-black placeholder:text-gray-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cantidadPlaya" className="text-black">
                  Cantidad Playa del Carmen
                </Label>
                <Input
                  id="cantidadPlaya"
                  type="number"
                  value={cantidadPlaya}
                  onChange={(e) => setCantidadPlaya(e.target.value)}
                  placeholder="0"
                  className="bg-white border-gray-300 text-black placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costo" className="text-black">
                  Costo
                </Label>
                <Input
                  id="costo"
                  type="number"
                  step="0.01"
                  value={costo}
                  onChange={(e) => setCosto(e.target.value)}
                  placeholder="0.00"
                  className="bg-white border-gray-300 text-black placeholder:text-gray-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="precio" className="text-black">
                  Precio de Venta
                </Label>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  placeholder="0.00"
                  className="bg-white border-gray-300 text-black placeholder:text-gray-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="utilidad" className="text-black">
                  Utilidad
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="utilidad"
                    type="number"
                    step="0.01"
                    value={utilidad}
                    readOnly
                    placeholder="0.00"
                    className="bg-gray-50 border-gray-300 text-green-600 placeholder:text-gray-400"
                  />
                  <Button type="button" onClick={calcularUtilidad} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Calcular
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ubicacion" className="text-black">
                Ubicación Principal
              </Label>
              <Select value={ubicacionPrincipal} onValueChange={(value) => setUbicacionPrincipal(value as Tienda)}>
                <SelectTrigger className="bg-white border-gray-300 text-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="Cancún" className="text-black">
                    Cancún
                  </SelectItem>
                  <SelectItem value="Playa del Carmen" className="text-black">
                    Playa del Carmen
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Agregar Producto
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
