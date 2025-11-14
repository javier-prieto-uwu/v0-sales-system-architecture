"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabaseClient"
import type { Tienda } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { Camera, Check, X } from "lucide-react"

// Cargar el escáner de forma dinámica para evitar SSR issues
const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner),
  { ssr: false }
)

type ScannedItem = {
  id: string
  sku: string
  nombre: string
  tipo: "producto" | "equipo"
  costo?: number
  precio?: number
  count: number
}

export function HacerInventario() {
  const [tiendaInventario, setTiendaInventario] = useState<Tienda>("Cancún")
  const [esMobile, setEsMobile] = useState(false)
  const [mostrarEscaner, setMostrarEscaner] = useState(false)
  const [escanerActivo, setEscanerActivo] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // Confirmación para el último SKU detectado
  const [skuPendiente, setSkuPendiente] = useState<string | null>(null)
  const [productoPendiente, setProductoPendiente] = useState<ScannedItem | null>(null)

  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([])

  const columnaInventario = useMemo(() => (tiendaInventario === "Cancún" ? "cantidad_cancun" : "cantidad_playa"), [tiendaInventario])

  useEffect(() => {
    const detectarMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
      const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0
      setEsMobile(isMobileDevice || isTouchDevice)
    }
    detectarMobile()
  }, [])

  const buscarProducto = async (sku: string): Promise<ScannedItem | null> => {
    try {
      // Intentar en refacciones
      const { data: refaccion, error: errorRef } = await supabase
        .from("refacciones")
        .select("*")
        .eq("sku", sku)
        .single()

      if (!errorRef && refaccion) {
        return {
          id: String(refaccion.id),
          sku: refaccion.sku,
          nombre: refaccion.nombre,
          tipo: "producto",
          costo: Number(refaccion.costo ?? 0),
          precio: Number(refaccion.precio ?? 0),
          count: 0,
        }
      }

      // Intentar en equipos
      const { data: equipo, error: errorEq } = await supabase
        .from("equipos")
        .select("*")
        .eq("sku", sku)
        .single()

      if (!errorEq && equipo) {
        return {
          id: String(equipo.id),
          sku: equipo.sku,
          nombre: equipo.nombre,
          tipo: "equipo",
          costo: Number(equipo.costo ?? 0),
          precio: Number(equipo.precio ?? 0),
          count: 0,
        }
      }

      return null
    } catch (error) {
      console.error("Error buscando SKU:", error)
      return null
    }
  }

  const activarEscaner = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: esMobile ? "environment" : "user",
            width: esMobile ? { ideal: 1280, max: 1920 } : { ideal: 1280 },
            height: esMobile ? { ideal: 720, max: 1080 } : { ideal: 720 },
          },
        })
        stream.getTracks().forEach((t) => t.stop())
        setMostrarEscaner(true)
        setEscanerActivo(true)
        setErrorMessage("")
      } else {
        throw new Error("getUserMedia no está disponible")
      }
    } catch (error) {
      console.error("Error al acceder a la cámara:", error)
      setErrorMessage("Error al acceder a la cámara. Verifica permisos y usa HTTPS en móvil.")
    }
  }

  const desactivarEscaner = () => {
    setMostrarEscaner(false)
    setEscanerActivo(false)
  }

  const manejarEscaneo = async (detectedCodes: any[]) => {
    if (detectedCodes && Array.isArray(detectedCodes) && detectedCodes.length > 0) {
      const firstCode = detectedCodes[0]
      const valor = firstCode?.rawValue || firstCode?.data || ""
      const sku = String(valor).trim()
      if (!sku) return

      // Buscar info y abrir confirmación
      const info = await buscarProducto(sku)
      if (!info) {
        setErrorMessage(`SKU no encontrado: ${sku}`)
        return
      }
      setSkuPendiente(sku)
      setProductoPendiente(info)
    }
  }

  const confirmarSku = () => {
    if (!productoPendiente) return
    setScannedItems((prev) => {
      const idx = prev.findIndex((p) => p.sku === productoPendiente.sku)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], count: next[idx].count + 1 }
        return next
      }
      return [...prev, { ...productoPendiente, count: 1 }]
    })
    setSuccessMessage(`Escaneado: ${productoPendiente.nombre}`)
    setTimeout(() => setSuccessMessage(""), 1500)
    setSkuPendiente(null)
    setProductoPendiente(null)
  }

  const cancelarSku = () => {
    setSkuPendiente(null)
    setProductoPendiente(null)
  }

  const aplicarConteoAInventario = async () => {
    if (scannedItems.length === 0) {
      setErrorMessage("No hay escaneos para aplicar")
      return
    }
    setLoading(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      for (const item of scannedItems) {
        if (item.tipo === "producto") {
          const { error } = await supabase
            .from("refacciones")
            .update({ [columnaInventario]: item.count })
            .eq("id", item.id)
          if (error) throw new Error(`Error actualizando refacción ${item.sku}: ${error.message}`)
        } else {
          const { error } = await supabase
            .from("equipos")
            .update({ [columnaInventario]: item.count })
            .eq("id", item.id)
          if (error) throw new Error(`Error actualizando equipo ${item.sku}: ${error.message}`)
        }
      }
      setSuccessMessage("Conteo aplicado al inventario correctamente")
      setTimeout(() => setSuccessMessage(""), 2500)
    } catch (error: any) {
      console.error("Error aplicando conteo:", error)
      setErrorMessage(error?.message || "Error aplicando conteo")
    }
    setLoading(false)
  }

  const agregarManual = async (sku: string) => {
    const limpio = sku.trim()
    if (!limpio) return
    const info = await buscarProducto(limpio)
    if (!info) {
      setErrorMessage(`SKU no encontrado: ${limpio}`)
      return
    }
    setProductoPendiente(info)
    setSkuPendiente(limpio)
  }

  const totalEscaneos = scannedItems.reduce((acc, it) => acc + it.count, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black">Hacer Inventario</h1>
      </div>

      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-black">Tienda objetivo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="max-w-xs">
            <Select value={tiendaInventario} onValueChange={(v) => setTiendaInventario(v as Tienda)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Selecciona tienda" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Cancún">Cancún</SelectItem>
                <SelectItem value="Playa del Carmen">Playa del Carmen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={activarEscaner} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={escanerActivo}>
              <Camera className="h-4 w-4 mr-2" /> Activar escáner
            </Button>
            <Button onClick={desactivarEscaner} variant="outline" disabled={!escanerActivo}>
              Desactivar
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Input placeholder="Escribe SKU para agregar manual" onKeyDown={(e) => {
              if (e.key === "Enter") agregarManual((e.target as HTMLInputElement).value)
            }} />
            <Button onClick={(e) => {
              const input = (e.currentTarget.previousSibling as HTMLInputElement)
              if (input && input.value) agregarManual(input.value)
            }} variant="secondary">Agregar</Button>
          </div>
        </CardContent>
      </Card>

      {mostrarEscaner && (
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-black">Escáner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <Scanner onScan={manejarEscaneo} onError={(e: any) => console.error("scanner error", e)} />
            </div>
            <p className="text-xs text-gray-500 mt-2">Escanea un código, confirma y se contabiliza. Cada confirmación suma 1.</p>
          </CardContent>
        </Card>
      )}

      {skuPendiente && productoPendiente && (
        <Card className="bg-white border-blue-200">
          <CardHeader>
            <CardTitle className="text-black">Confirmar código</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <div className="font-mono text-blue-700">SKU: {productoPendiente.sku}</div>
              <div className="text-black font-medium">{productoPendiente.nombre}</div>
              <div className="text-gray-600 text-sm">Tipo: {productoPendiente.tipo}</div>
            </div>
            <div className="flex gap-2">
              <Button onClick={confirmarSku} className="bg-green-600 hover:bg-green-700 text-white">
                <Check className="h-4 w-4 mr-1" /> Está bien
              </Button>
              <Button onClick={cancelarSku} variant="outline">
                <X className="h-4 w-4 mr-1" /> Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-black">Escaneos ({totalEscaneos})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="text-gray-700">SKU</TableHead>
                  <TableHead className="text-gray-700">Nombre</TableHead>
                  <TableHead className="text-gray-700">Tipo</TableHead>
                  <TableHead className="text-gray-700 text-right">Conteo</TableHead>
                  <TableHead className="text-gray-700 text-right">Costo</TableHead>
                  <TableHead className="text-gray-700 text-right">Precio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scannedItems.map((it) => (
                  <TableRow key={it.sku} className="border-gray-200">
                    <TableCell className="font-mono text-blue-600">{it.sku}</TableCell>
                    <TableCell className="text-black font-medium">{it.nombre}</TableCell>
                    <TableCell className="text-gray-600">{it.tipo}</TableCell>
                    <TableCell className="text-right font-semibold text-black">{it.count}</TableCell>
                    <TableCell className="text-right text-gray-700">{it.costo != null ? formatCurrency(it.costo) : "-"}</TableCell>
                    <TableCell className="text-right text-gray-700">{it.precio != null ? formatCurrency(it.precio) : "-"}</TableCell>
                  </TableRow>
                ))}
                {scannedItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-6">Aún no hay escaneos</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={aplicarConteoAInventario} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading || scannedItems.length === 0}>
          Aplicar conteo a inventario ({tiendaInventario})
        </Button>
        {successMessage && <span className="text-green-700 text-sm">{successMessage}</span>}
        {errorMessage && <span className="text-red-700 text-sm">{errorMessage}</span>}
      </div>
    </div>
  )
}

export default HacerInventario