"use client"

import type React from "react" 
//ol

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Tecnologia } from "@/lib/types"
import { supabase } from "@/lib/supabaseClient"
import { Trash2 } from "lucide-react"

export function AgregarProducto() {
  const [tipoInventario, setTipoInventario] = useState<"normal" | "equipo">("normal")
  const [sku, setSku] = useState("")
  const [nombre, setNombre] = useState("")
  // Restaurar estados que se usan en el formulario
  const [categoriasList, setCategoriasList] = useState<string[]>([
    "Controles",
    "Misceláneos",
    "Motores de Evaporador",
  ])
  const [categoria, setCategoria] = useState<string>("Controles")
  const [newCategoria, setNewCategoria] = useState<string>("")
  const [modelo, setModelo] = useState<string>("LIFE12+")
  const [tecnologia, setTecnologia] = useState<Tecnologia>("Convencional")
  const [btu, setBtu] = useState("")
  const [voltaje, setVoltaje] = useState("")
  const [cantidadCancun, setCantidadCancun] = useState("")
  const [cantidadPlaya, setCantidadPlaya] = useState("")
  const [costo, setCosto] = useState("")
  const [precio, setPrecio] = useState("")
  const [utilidad, setUtilidad] = useState("")
  const [modelosList, setModelosList] = useState<string[]>(["LIFE12+", "NEX 2023", "XLIFE"])
  const [newModelo, setNewModelo] = useState<string>("")
  // Cargar categorías desde catálogo (public.catalogo_categorias)
  useEffect(() => {
    const loadCategorias = async () => {
      const { data, error } = await supabase.from("catalogo_categorias").select("nombre")
      if (error) {
        console.error("Error cargando categorías:", error.message)
        return
      }
      const fetched = (data || []).map((d: any) => d.nombre).filter(Boolean)
      setCategoriasList((prev: string[]) => Array.from(new Set([...prev, ...fetched])))
    }
    loadCategorias()
  }, [])

  // Eliminar categoría desde catálogo y estado local
  const deleteCategoria = async (nombre: string) => {
    const ok = typeof window !== "undefined" ? window.confirm(`¿Eliminar la categoría "${nombre}"?`) : true
    if (!ok) return
    try {
      const { error } = await supabase.from("catalogo_categorias").delete().eq("nombre", nombre)
      if (error) {
        console.error("Error eliminando categoría:", error.message)
        alert(`Error eliminando categoría: ${error.message}`)
        return
      }
      const updated = categoriasList.filter((c) => c !== nombre)
      setCategoriasList(updated)
      if (categoria === nombre) {
        setCategoria(updated[0] || "")
      }
      alert("Categoría eliminada")
    } catch (err: any) {
      console.error("Error eliminando categoría:", err?.message || String(err))
      alert(`Error eliminando categoría: ${err?.message || String(err)}`)
    }
  }

  // Cargar modelos desde catálogo (public.catalogo_modelos)
  useEffect(() => {
    const loadModelos = async () => {
      const { data, error } = await supabase.from("catalogo_modelos").select("nombre")
      if (error) {
        console.error("Error cargando modelos:", error.message)
        return
      }
      const fetched = (data || []).map((d: any) => d.nombre).filter(Boolean)
      setModelosList((prev: string[]) => Array.from(new Set([...prev, ...fetched])))
    }
    loadModelos()
  }, [])

  // Eliminar modelo desde catálogo y estado local (equipos)
  const deleteModelo = async (nombre: string) => {
    const ok = typeof window !== "undefined" ? window.confirm(`¿Eliminar el modelo "${nombre}"?`) : true
    if (!ok) return
    try {
      const { error } = await supabase.from("catalogo_modelos").delete().eq("nombre", nombre)
      if (error) {
        console.error("Error eliminando modelo:", error.message)
        alert(`Error eliminando modelo: ${error.message}`)
        return
      }
      const updated = modelosList.filter((m) => m !== nombre)
      setModelosList(updated)
      if (modelo === nombre) {
        setModelo(updated[0] || "")
      }
      alert("Modelo eliminado")
    } catch (err: any) {
      console.error("Error eliminando modelo:", err?.message || String(err))
      alert(`Error eliminando modelo: ${err?.message || String(err)}`)
    }
  }

  const calcularUtilidad = () => {
    const costoNum = Number.parseFloat(costo) || 0
    const precioNum = Number.parseFloat(precio) || 0
    const utilidadCalculada = precioNum - costoNum
    setUtilidad(utilidadCalculada.toFixed(2))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (tipoInventario === "equipo") {
      const payloadEquipos = {
        sku,
        nombre,
        modelo,
        tecnologia,
        btu: Number.parseInt(btu) || null,
        voltaje: Number.parseInt(voltaje) || null,
        costo: Number.parseFloat(costo) || 0,
        precio: Number.parseFloat(precio) || 0,
        cantidad_cancun: Number.parseInt(cantidadCancun) || 0,
        cantidad_playa: Number.parseInt(cantidadPlaya) || 0,
      }

      const { error } = await supabase.from("equipos").insert(payloadEquipos)
      if (error) {
        console.error("Error al guardar equipo:", error.message)
        alert(`Error al guardar equipo: ${error.message}`)
        return
      }
      alert("Equipo agregado a la tabla 'equipos' (Supabase)")
    } else {
      // Inventario normal: refacciones
      const payloadRefacciones = {
        sku,
        nombre,
        categoria,
        costo: Number.parseFloat(costo) || 0,
        precio: Number.parseFloat(precio) || 0,
        cantidad_cancun: Number.parseInt(cantidadCancun) || 0,
        cantidad_playa: Number.parseInt(cantidadPlaya) || 0,
      }

      const { error } = await supabase.from("refacciones").insert(payloadRefacciones)
      if (error) {
        console.error("Error al guardar refacción:", error.message)
        alert(`Error al guardar refacción: ${error.message}`)
        return
      }
      alert("Producto agregado a la tabla 'refacciones' (Supabase)")
    }

    // Reset del formulario
    setSku("")
    setNombre("")
    setCantidadCancun("")
    setCantidadPlaya("")
    setCosto("")
    setPrecio("")
    setUtilidad("")
    setBtu("")
    setVoltaje("")
    setCategoria("Controles")
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
            <div className="grid lg:grid-cols-2 gap-4">
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
                <Select value={categoria} onValueChange={(value) => setCategoria(value)}>
                  <SelectTrigger className="bg-white border-gray-300 text-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {categoriasList.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-black">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                  <Input
                    id="nueva-categoria"
                    value={newCategoria}
                    onChange={(e) => setNewCategoria(e.target.value)}
                    placeholder="Nueva categoría"
                    className="bg-white border-gray-300 text-black placeholder:text-gray-400"
                  />
                  <Button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={async () => {
                      const nombre = newCategoria.trim()
                      if (!nombre) return
                      const existe = categoriasList.some(
                        (c) => c.toLowerCase() === nombre.toLowerCase()
                      )
                      try {
                        const { error } = await supabase
                          .from("catalogo_categorias")
                          .upsert({ nombre }, { onConflict: "nombre" })
                        if (error) {
                          console.error("Error registrando categoría:", error.message)
                          alert(`Error registrando categoría: ${error.message}`)
                          return
                        }
                        if (!existe) {
                          setCategoriasList((prev) => [...prev, nombre])
                        }
                        setCategoria(nombre)
                        setNewCategoria("")
                      } catch (err: any) {
                        console.error("Error registrando categoría:", err?.message || String(err))
                        alert(`Error registrando categoría: ${err?.message || String(err)}`)
                      }
                    }}
                  >
                    Agregar
                  </Button>
                </div>

                {/* Administrar categorías: listado con opción de eliminar */}
                <div className="mt-4">
                  <div className="text-sm text-gray-700">Administrar categorías</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {categoriasList.map((cat) => (
                      <div key={cat} className="flex items-center gap-2 px-3 py-1 rounded-full border border-gray-300 bg-white text-black">
                        <span className="text-sm">{cat}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-0 h-6"
                          onClick={() => deleteCategoria(cat)}
                          title="Eliminar categoría"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tipoInventario === "equipo" && (
              <>
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="modelo" className="text-black">
                      Modelo
                    </Label>
                    <Select value={modelo} onValueChange={(value) => setModelo(value)}>
                      <SelectTrigger className="bg-white border-gray-300 text-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {modelosList.map((mod) => (
                          <SelectItem key={mod} value={mod} className="text-black">
                            {mod}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                      <Input
                        id="nuevo-modelo"
                        value={newModelo}
                        onChange={(e) => setNewModelo(e.target.value)}
                        placeholder="Nuevo modelo"
                        className="bg-white border-gray-300 text-black placeholder:text-gray-400"
                      />
                      <Button
                        type="button"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={async () => {
                          const nombre = newModelo.trim()
                          if (!nombre) return
                          const existe = modelosList.some((m) => m.toLowerCase() === nombre.toLowerCase())
                          try {
                            const { error } = await supabase
                              .from("catalogo_modelos")
                              .upsert({ nombre }, { onConflict: "nombre" })
                            if (error) {
                              console.error("Error registrando modelo:", error.message)
                              alert(`Error registrando modelo: ${error.message}`)
                              return
                            }
                            if (!existe) {
                              setModelosList((prev) => [...prev, nombre])
                            }
                            setModelo(nombre)
                            setNewModelo("")
                          } catch (err: any) {
                            console.error("Error registrando modelo:", err?.message || String(err))
                            alert(`Error registrando modelo: ${err?.message || String(err)}`)
                          }
                        }}
                      >
                        Agregar
                      </Button>
                    </div>
                    {/* Administrar modelos: listado con opción de eliminar */}
                    <div className="mt-4">
                      <div className="text-sm text-gray-700">Administrar modelos</div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {modelosList.map((mod) => (
                          <div key={mod} className="flex items-center gap-2 px-3 py-1 rounded-full border border-gray-300 bg-white text-black">
                            <span className="text-sm">{mod}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-0 h-6"
                              onClick={() => deleteModelo(mod)}
                              title="Eliminar modelo"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
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

                <div className="grid lg:grid-cols-2 gap-4">
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



            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Agregar Producto
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
