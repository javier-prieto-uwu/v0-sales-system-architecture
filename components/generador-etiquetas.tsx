"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Etiqueta } from "@/lib/types"
import { Trash2, FileDown, Plus } from "lucide-react"
import JsBarcode from "jsbarcode"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export function GeneradorEtiquetas() {
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([])
  const [pieza, setPieza] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [cantidad, setCantidad] = useState("1")
  const [textoPegado, setTextoPegado] = useState("")
  const [anchoEtiqueta, setAnchoEtiqueta] = useState("80")
  const etiquetasRef = useRef<HTMLDivElement>(null)

  const agregarEtiqueta = () => {
    if (!pieza.trim() || !descripcion.trim()) {
      alert("Completa todos los campos")
      return
    }

    const nuevaEtiqueta: Etiqueta = {
      pieza: pieza.trim(),
      descripcion: descripcion.trim(),
      cantidad: Number.parseInt(cantidad) || 1,
    }

    setEtiquetas([...etiquetas, nuevaEtiqueta])
    setPieza("")
    setDescripcion("")
    setCantidad("1")
  }

  const procesarTextoPegado = () => {
    if (!textoPegado.trim()) return

    const lineas = textoPegado.trim().split("\n")
    const nuevasEtiquetas: Etiqueta[] = []

    lineas.forEach((linea) => {
      const partes = linea.split("\t")
      if (partes.length >= 3) {
        nuevasEtiquetas.push({
          pieza: partes[0].trim(),
          descripcion: partes[1].trim(),
          cantidad: Number.parseInt(partes[2]) || 1,
        })
      }
    })

    if (nuevasEtiquetas.length > 0) {
      setEtiquetas([...etiquetas, ...nuevasEtiquetas])
      setTextoPegado("")
    }
  }

  const eliminarEtiqueta = (index: number) => {
    setEtiquetas(etiquetas.filter((_, i) => i !== index))
  }

  const generarPDF = async () => {
    if (etiquetas.length === 0) {
      alert("No hay etiquetas para generar")
      return
    }

    const container = etiquetasRef.current
    if (!container) return

    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: "#ffffff",
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "letter",
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pdfWidth - 20
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 10

    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight)
    heightLeft -= pdfHeight - 20

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight - 20
    }

    pdf.save("etiquetas-mirage.pdf")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black">Generador de Etiquetas</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-black">Agregar Etiqueta Individual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pieza" className="text-black">
                Pieza / SKU
              </Label>
              <Input
                id="pieza"
                value={pieza}
                onChange={(e) => setPieza(e.target.value)}
                placeholder="Ej: MRC4K2E"
                className="bg-white border-gray-300 text-black placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion" className="text-black">
                Descripción
              </Label>
              <Input
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Control Remoto Universal"
                className="bg-white border-gray-300 text-black placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cantidad" className="text-black">
                Cantidad
              </Label>
              <Input
                id="cantidad"
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="bg-white border-gray-300 text-black"
              />
            </div>

            <Button onClick={agregarEtiqueta} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Etiqueta
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-black">Pegar desde Excel / CSV</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="textoPegado" className="text-black">
                Pegar datos (Pieza, Descripción, Cantidad separados por tabulador)
              </Label>
              <Textarea
                id="textoPegado"
                value={textoPegado}
                onChange={(e) => setTextoPegado(e.target.value)}
                placeholder="MRC4K2E	Control Remoto Universal	5&#10;CAP_ARRANQUE_2	Capacitor de Arranque	3"
                rows={6}
                className="bg-white border-gray-300 text-black placeholder:text-gray-400 font-mono text-sm"
              />
            </div>

            <Button onClick={procesarTextoPegado} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Procesar Datos Pegados
            </Button>
          </CardContent>
        </Card>
      </div>

      {etiquetas.length > 0 && (
        <>
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-black">Lista de Etiquetas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 hover:bg-gray-50">
                      <TableHead className="text-gray-700">Pieza</TableHead>
                      <TableHead className="text-gray-700">Descripción</TableHead>
                      <TableHead className="text-gray-700 text-right">Cantidad</TableHead>
                      <TableHead className="text-gray-700 text-center">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {etiquetas.map((etiqueta, index) => (
                      <TableRow key={index} className="border-gray-200 hover:bg-gray-50">
                        <TableCell className="font-mono text-blue-600">{etiqueta.pieza}</TableCell>
                        <TableCell className="text-black">{etiqueta.descripcion}</TableCell>
                        <TableCell className="text-right text-black">{etiqueta.cantidad}</TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => eliminarEtiqueta(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-black">Configuración de Impresión</CardTitle>
                <Button onClick={generarPDF} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <FileDown className="h-4 w-4 mr-2" />
                  Generar PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="anchoEtiqueta" className="text-black">
                  Ancho de Etiqueta (mm)
                </Label>
                <Input
                  id="anchoEtiqueta"
                  type="number"
                  min="50"
                  max="200"
                  value={anchoEtiqueta}
                  onChange={(e) => setAnchoEtiqueta(e.target.value)}
                  className="bg-white border-gray-300 text-black w-32"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-black">Vista Previa de Etiquetas</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={etiquetasRef} className="grid grid-cols-2 gap-4 p-4 bg-white">
                {etiquetas.map((etiqueta, index) =>
                  Array.from({ length: etiqueta.cantidad }).map((_, cantIndex) => (
                    <EtiquetaItem
                      key={`${index}-${cantIndex}`}
                      pieza={etiqueta.pieza}
                      descripcion={etiqueta.descripcion}
                      ancho={Number.parseInt(anchoEtiqueta)}
                    />
                  )),
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

interface EtiquetaItemProps {
  pieza: string
  descripcion: string
  ancho: number
}

function EtiquetaItem({ pieza, descripcion, ancho }: EtiquetaItemProps) {
  const barcodeRef = useRef<SVGSVGElement>(null)

  useState(() => {
    if (barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, pieza, {
          format: "CODE128",
          width: 2,
          height: 50,
          displayValue: true,
          fontSize: 14,
          textMargin: 2,
          margin: 5,
        })
      } catch (error) {
        console.error("[v0] Error generando código de barras:", error)
      }
    }
  })

  return (
    <div
      className="border-2 border-gray-300 p-3 bg-white flex flex-col items-center justify-center"
      style={{ width: `${ancho}mm`, minHeight: "40mm" }}
    >
      <div className="text-center mb-2">
        <div className="font-bold text-sm text-black mb-1">{pieza}</div>
        <div className="text-xs text-black">{descripcion}</div>
      </div>
      <svg ref={barcodeRef} className="w-full" />
    </div>
  )
}
