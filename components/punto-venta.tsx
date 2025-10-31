"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { vendedores, productos, equipos, inventarioProductos, inventarioEquipos } from "@/lib/data"
import type { Tienda, MetodoPago, TipoTarjeta, ItemCarrito, Cliente } from "@/lib/types"
import { Trash2, ShoppingCart, Plus, Users, ChevronDown, Camera, X } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { formatCurrency } from "@/lib/utils"

// Importar el escáner de forma dinámica para evitar problemas de SSR
const Scanner = dynamic(
  () => import('@yudiel/react-qr-scanner').then((mod) => mod.Scanner),
  { ssr: false }
)

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
  
  // Estados para gestión de vendedores
  const [vendedoresList, setVendedoresList] = useState<any[]>([])
  const [mostrarGestionVendedores, setMostrarGestionVendedores] = useState(false)
  const [nuevoVendedorNombre, setNuevoVendedorNombre] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  
  // Estados para autocompletado de clientes
  const [clientesList, setClientesList] = useState<Cliente[]>([])
  const [clientesSugeridos, setClientesSugeridos] = useState<Cliente[]>([])
  const [mostrarSugerenciasClientes, setMostrarSugerenciasClientes] = useState(false)
  const [mostrarListaClientes, setMostrarListaClientes] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  
  // Estados para gestión de clientes
  const [mostrarGestionClientes, setMostrarGestionClientes] = useState(false)
  const [nuevoClienteNombre, setNuevoClienteNombre] = useState("")
  const [nuevoClienteTelefono, setNuevoClienteTelefono] = useState("")
  const [nuevoClienteEmail, setNuevoClienteEmail] = useState("")
  
  // Estado para prevenir ventas duplicadas
  const [procesandoVenta, setProcesandoVenta] = useState(false)

  // Estados para el escáner de códigos de barras
  const [mostrarEscaner, setMostrarEscaner] = useState(false)
  const [escanerActivo, setEscanerActivo] = useState(false)

  const vendedoresFiltrados = vendedoresList.filter((v) => v.activo && v.tienda === tiendaVenta)

  // Cargar vendedores desde la base de datos
  useEffect(() => {
    const cargarVendedores = async () => {
      setLoading(true)
      setErrorMessage("")
      
      try {
        // Intentar cargar desde la base de datos
        const { data, error } = await supabase
          .from("vendedores")
          .select("*")
          .eq("activo", true)
          .eq("tienda", tiendaVenta)
          .order("nombre", { ascending: true })

        if (error) {
          console.error("Error cargando vendedores:", error.message)
          if (error.message.includes("table") && error.message.includes("vendedores")) {
            setErrorMessage("La tabla 'vendedores' no existe en Supabase. Consulta SUPABASE_SETUP.md para configurar la base de datos.")
          } else {
            setErrorMessage(`Error cargando vendedores: ${error.message}. Usando datos locales.`)
          }
          // Usar datos hardcodeados como fallback
          setVendedoresList(vendedores)
        } else {
          setVendedoresList(data || [])
          if (data && data.length === 0) {
            setErrorMessage("No se encontraron vendedores en la base de datos. Usando datos locales.")
            setVendedoresList(vendedores)
          }
        }
      } catch (error) {
        console.error("Error conectando con la base de datos:", error)
        setErrorMessage("Error de conexión con Supabase. Usando datos locales. Verifica tu configuración.")
        // Usar datos hardcodeados como fallback
        setVendedoresList(vendedores)
      }
      setLoading(false)
    }

    cargarVendedores()
  }, [tiendaVenta])

  // Cargar clientes desde la base de datos
  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const { data, error } = await supabase
          .from("clientes")
          .select("*")
          .order("nombre", { ascending: true })

        if (error) {
          console.error("Error cargando clientes:", error)
        } else if (data) {
          setClientesList(data)
        }
      } catch (error) {
        console.error("Error conectando con la base de datos para clientes:", error)
      }
    }

    cargarClientes()
  }, [])

  // Crear nuevo vendedor
  const crearVendedor = async () => {
    if (!nuevoVendedorNombre.trim()) {
      setErrorMessage("Por favor ingresa un nombre para el vendedor")
      return
    }

    setLoading(true)
    setErrorMessage("")
    setSuccessMessage("")
    
    try {
      const { data, error } = await supabase
        .from("vendedores")
        .insert([
          {
            nombre: nuevoVendedorNombre.trim(),
            email: `${nuevoVendedorNombre.trim().toLowerCase().replace(/\s+/g, '.')}@empresa.com`,
            tienda: tiendaVenta,
            activo: true,
          },
        ])
        .select()

      if (error) {
        console.error("Error creando vendedor:", error.message)
        if (error.message.includes("table") && error.message.includes("vendedores")) {
          setErrorMessage("La tabla 'vendedores' no existe en Supabase. Por favor, consulta SUPABASE_SETUP.md para configurar la base de datos.")
        } else {
          setErrorMessage(`Error al crear el vendedor: ${error.message}`)
        }
      } else {
        // Actualizar la lista local
        setVendedoresList([...vendedoresList, ...(data || [])])
        setNuevoVendedorNombre("")
        setSuccessMessage("Vendedor creado exitosamente")
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => setSuccessMessage(""), 3000)
      }
    } catch (error) {
      console.error("Error conectando con la base de datos:", error)
      setErrorMessage("Error de conexión con la base de datos. Verifica tu configuración de Supabase.")
    }
    setLoading(false)
  }

  // Eliminar vendedor
  const eliminarVendedor = async (vendedorId: string, vendedorNombre: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar al vendedor "${vendedorNombre}"?`)) {
      return
    }

    setLoading(true)
    setErrorMessage("")
    setSuccessMessage("")
    
    try {
      // Intentar eliminar de la base de datos
      const { error } = await supabase
        .from("vendedores")
        .delete()
        .eq("id", vendedorId)

      if (error) {
        console.error("Error eliminando vendedor:", error.message)
        if (error.message.includes("table") && error.message.includes("vendedores")) {
          setErrorMessage("La tabla 'vendedores' no existe en Supabase. Por favor, consulta SUPABASE_SETUP.md para configurar la base de datos.")
        } else {
          setErrorMessage(`Error al eliminar el vendedor: ${error.message}`)
        }
      } else {
        // Actualizar la lista local
        setVendedoresList(vendedoresList.filter((v) => v.id !== vendedorId))
        // Si el vendedor eliminado estaba seleccionado, limpiar la selección
        if (vendedorSeleccionado === vendedorNombre) {
          setVendedorSeleccionado("")
        }
        setSuccessMessage("Vendedor eliminado exitosamente")
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => setSuccessMessage(""), 3000)
      }
    } catch (error) {
      console.error("Error conectando con la base de datos:", error)
      setErrorMessage("Error de conexión con la base de datos. Verifica tu configuración de Supabase.")
    }
    setLoading(false)
  }

  // Funciones para autocompletado de clientes
  const buscarClientes = (termino: string) => {
    if (termino.length < 2) {
      setClientesSugeridos([])
      setMostrarSugerenciasClientes(false)
      return
    }

    const clientesFiltrados = clientesList.filter(cliente =>
      cliente.nombre.toLowerCase().includes(termino.toLowerCase())
    )
    setClientesSugeridos(clientesFiltrados.slice(0, 5)) // Mostrar máximo 5 sugerencias
    setMostrarSugerenciasClientes(clientesFiltrados.length > 0)
  }

  const seleccionarCliente = (cliente: Cliente) => {
    setCliente(cliente.nombre)
    setClienteSeleccionado(cliente)
    setMostrarSugerenciasClientes(false)
  }

  const manejarCambioCliente = (valor: string) => {
    setCliente(valor)
    setClienteSeleccionado(null)
    if (valor.length >= 2) {
      buscarClientes(valor)
      setMostrarSugerenciasClientes(true)
    } else {
      setMostrarSugerenciasClientes(false)
    }
  }

  const abrirListaClientes = () => {
    setMostrarListaClientes(true)
    setClientesSugeridos(clientesList.slice(0, 10)) // Mostrar los primeros 10 clientes
  }

  const cerrarListaClientes = () => {
    setTimeout(() => {
      setMostrarListaClientes(false)
    }, 200)
  }

  const crearNuevoClienteDesdeDropdown = () => {
    setMostrarListaClientes(false)
    setMostrarGestionClientes(true)
  }

  const crearNuevoCliente = async (nombre: string) => {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .insert([{ nombre: nombre.trim() }])
        .select()

      if (error) {
        console.error("Error creando cliente:", error)
        return null
      } else if (data && data.length > 0) {
        const nuevoCliente = data[0]
        setClientesList([...clientesList, nuevoCliente])
        return nuevoCliente
      }
    } catch (error) {
      console.error("Error conectando con la base de datos para crear cliente:", error)
    }
    return null
  }

  // Crear cliente completo desde el gestor
  const crearClienteCompleto = async () => {
    if (!nuevoClienteNombre.trim()) {
      setErrorMessage("Por favor ingresa un nombre para el cliente")
      return
    }

    setLoading(true)
    setErrorMessage("")
    setSuccessMessage("")
    
    try {
      const { data, error } = await supabase
        .from("clientes")
        .insert([
          {
            nombre: nuevoClienteNombre.trim(),
            telefono: nuevoClienteTelefono.trim() || null,
            email: nuevoClienteEmail.trim() || null,
          },
        ])
        .select()

      if (error) {
        console.error("Error creando cliente:", error.message)
        setErrorMessage(`Error al crear el cliente: ${error.message}`)
      } else if (data && data.length > 0) {
        // Actualizar la lista local
        setClientesList([...clientesList, ...data])
        // Limpiar formulario
        setNuevoClienteNombre("")
        setNuevoClienteTelefono("")
        setNuevoClienteEmail("")
        setSuccessMessage("Cliente creado exitosamente")
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => setSuccessMessage(""), 3000)
      }
    } catch (error) {
      console.error("Error conectando con la base de datos:", error)
      setErrorMessage("Error de conexión con la base de datos. Verifica tu configuración de Supabase.")
    }
    setLoading(false)
  }

  // Eliminar cliente
  const eliminarCliente = async (clienteId: string, clienteNombre: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar al cliente "${clienteNombre}"?`)) {
      return
    }

    setLoading(true)
    setErrorMessage("")
    setSuccessMessage("")
    
    try {
      const { error } = await supabase
        .from("clientes")
        .delete()
        .eq("id", clienteId)

      if (error) {
        console.error("Error eliminando cliente:", error.message)
        setErrorMessage(`Error al eliminar el cliente: ${error.message}`)
      } else {
        // Actualizar la lista local
        setClientesList(clientesList.filter((c) => c.id !== clienteId))
        // Si el cliente eliminado estaba seleccionado, limpiar la selección
        if (clienteSeleccionado?.id === clienteId) {
          setClienteSeleccionado(null)
          setCliente("")
        }
        setSuccessMessage("Cliente eliminado exitosamente")
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => setSuccessMessage(""), 3000)
      }
    } catch (error) {
      console.error("Error conectando con la base de datos:", error)
      setErrorMessage("Error de conexión con la base de datos. Verifica tu configuración de Supabase.")
    }
    setLoading(false)
  }

  const buscarProducto = async (sku: string) => {
    try {
      // Buscar en refacciones
      const { data: refaccion, error: errorRefaccion } = await supabase
        .from("refacciones")
        .select("*")
        .eq("sku", sku)
        .single()

      if (!errorRefaccion && refaccion) {
        return {
          id: refaccion.id.toString(),
          tipo: "producto" as const,
          sku: refaccion.sku,
          nombre: refaccion.nombre,
          costo: refaccion.costo,
          precio: refaccion.precio,
          utilidad: refaccion.precio - refaccion.costo,
        }
      }

      // Buscar en equipos
      const { data: equipo, error: errorEquipo } = await supabase
        .from("equipos")
        .select("*")
        .eq("sku", sku)
        .single()

      if (!errorEquipo && equipo) {
        return {
          id: equipo.id.toString(),
          tipo: "equipo" as const,
          sku: equipo.sku,
          nombre: equipo.nombre,
          costo: equipo.costo,
          precio: equipo.precio,
          utilidad: equipo.precio - equipo.costo,
        }
      }

      // Si no se encuentra en Supabase, buscar en datos locales como fallback
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

      const equipoLocal = equipos.find((e) => e.sku.toLowerCase() === sku.toLowerCase())
      if (equipoLocal) {
        return {
          id: equipoLocal.id,
          tipo: "equipo" as const,
          sku: equipoLocal.sku,
          nombre: equipoLocal.nombre,
          costo: equipoLocal.costo,
          precio: equipoLocal.precio,
          utilidad: equipoLocal.utilidad,
        }
      }

      return null
    } catch (error) {
      console.error("Error buscando producto:", error)
      
      // Fallback a datos locales en caso de error
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

      const equipoLocal = equipos.find((e) => e.sku.toLowerCase() === sku.toLowerCase())
      if (equipoLocal) {
        return {
          id: equipoLocal.id,
          tipo: "equipo" as const,
          sku: equipoLocal.sku,
          nombre: equipoLocal.nombre,
          costo: equipoLocal.costo,
          precio: equipoLocal.precio,
          utilidad: equipoLocal.utilidad,
        }
      }

      return null
    }
  }

  const agregarAlCarrito = async () => {
    if (!skuInput.trim()) return

    setLoading(true)
    setErrorMessage("")

    try {
      const item = await buscarProducto(skuInput)
      if (!item) {
        setErrorMessage("Producto no encontrado en inventario de refacciones ni equipos")
        setLoading(false)
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
      setSuccessMessage(`${item.nombre} agregado al carrito`)
      setTimeout(() => setSuccessMessage(""), 2000)
    } catch (error) {
      console.error("Error agregando al carrito:", error)
      setErrorMessage("Error al buscar el producto")
    }
    
    setLoading(false)
  }

  // Funciones para el escáner de códigos de barras
  const activarEscaner = () => {
    setMostrarEscaner(true)
    setEscanerActivo(true)
    setErrorMessage("")
  }

  const desactivarEscaner = () => {
    setMostrarEscaner(false)
    setEscanerActivo(false)
  }

  const manejarEscaneo = (result: any) => {
    if (result && result.text) {
      // Mostrar confirmación con el código escaneado
      const confirmar = window.confirm(`Código escaneado: ${result.text}\n\n¿Deseas agregar este código al SKU?`)
      
      if (confirmar) {
        // Si confirma, agregar el código al SKU y cerrar escáner
        setSkuInput(result.text)
        setSuccessMessage(`Código agregado: ${result.text}`)
        desactivarEscaner()
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => setSuccessMessage(""), 3000)
      }
      // Si no confirma, el escáner sigue activo para continuar escaneando
    }
  }

  const manejarErrorEscaner = (error: any) => {
    console.error("Error del escáner:", error)
    if (error?.name === 'NotAllowedError') {
      setErrorMessage("Acceso a la cámara denegado. Por favor, permite el acceso a la cámara para usar el escáner.")
    } else if (error?.name === 'NotFoundError') {
      setErrorMessage("No se encontró ninguna cámara disponible.")
    } else {
      setErrorMessage("Error al acceder a la cámara. Verifica que tu dispositivo tenga cámara y que el navegador tenga permisos.")
    }
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

  // Funciones MCP para Supabase
  const guardarVentaEnSupabase = async (ventaData: any) => {
    try {
      // Usar el cliente de Supabase directamente
      const { data, error } = await supabase
        .from('ventas')
        .insert([{
          fecha: ventaData.fecha,
          nota_venta: ventaData.nota_venta,
          factura: ventaData.factura,
          cliente: ventaData.cliente,
          cliente_id: ventaData.cliente_id,
          vendedor: ventaData.vendedor,
          tienda: ventaData.tienda,
          metodo_pago: ventaData.metodo_pago,
          tipo_tarjeta: ventaData.tipo_tarjeta,
          costo_total: ventaData.costo_total,
          venta_total: ventaData.venta_total,
          utilidad_total: ventaData.utilidad_total,
          equipos_vendidos: ventaData.equipos_vendidos,
          refacciones_vendidas: ventaData.refacciones_vendidas
        }])
        .select('id')
        .single()

      if (error) {
        console.error('Error guardando venta:', error)
        throw new Error(`Error al guardar venta: ${error.message}`)
      }

      console.log("[DEBUG] Venta guardada exitosamente:", data)
      return data.id
    } catch (error) {
      console.error('Error guardando venta:', error)
      throw error
    }
  }

  const guardarItemsVenta = async (ventaId: string, items: ItemCarrito[]) => {
    try {
      console.log("[DEBUG] Guardando items para venta ID:", ventaId)
      console.log("[DEBUG] Items a guardar:", items)
      
      // Usar el cliente de Supabase directamente
      const itemsData = items.map(item => ({
        venta_id: ventaId,
        producto_id: item.id,
        sku: item.sku,
        nombre: item.nombre,
        tipo: item.tipo,
        cantidad: item.cantidad,
        costo: item.costo,
        precio: item.precio,
        utilidad: item.utilidad
      }))

      const { error } = await supabase
        .from('venta_items')
        .insert(itemsData)

      if (error) {
        console.error('Error guardando items de venta:', error)
        throw new Error(`Error al guardar items de venta: ${error.message}`)
      }

      console.log("[DEBUG] Items de venta guardados exitosamente")
    } catch (error) {
      console.error('Error guardando items de venta:', error)
      throw error
    }
  }

  const registrarVenta = async () => {
    // Prevenir ventas duplicadas
    if (procesandoVenta) {
      return
    }

    if (!vendedorSeleccionado) {
      alert("Selecciona un vendedor")
      return
    }

    if (carrito.length === 0) {
      alert("El carrito está vacío")
      return
    }

    setProcesandoVenta(true)

    try {
      // Registrar cliente automáticamente si no existe
      let clienteFinal = cliente
      let clienteId = clienteSeleccionado?.id || null
      
      if (cliente.trim() && !clienteSeleccionado) {
        const nuevoCliente = await crearNuevoCliente(cliente)
        if (nuevoCliente) {
          setClienteSeleccionado(nuevoCliente)
          clienteFinal = nuevoCliente.nombre
          clienteId = nuevoCliente.id
        }
      }

      const totales = calcularTotales()

      // Preparar datos de la venta para MCP
      const ventaData = {
        fecha: new Date().toISOString().split("T")[0],
        nota_venta: notaVenta || null,
        factura: factura || null,
        cliente: clienteFinal,
        cliente_id: clienteId,
        vendedor: vendedorSeleccionado,
        tienda: tiendaVenta,
        metodo_pago: metodoPago,
        tipo_tarjeta: tipoTarjeta || null,
        costo_total: totales.costoTotal,
        venta_total: totales.ventaTotal,
        utilidad_total: totales.utilidadTotal,
        equipos_vendidos: totales.equiposVendidos,
        refacciones_vendidas: totales.refaccionesVendidas
      }

      console.log("[v0] Guardando venta en Supabase:", ventaData)

       // Guardar venta usando MCP
       const ventaId = await guardarVentaEnSupabase(ventaData)
       
       if (ventaId) {
         // Guardar items de la venta
         await guardarItemsVenta(ventaId, carrito)
         console.log("[v0] Venta guardada exitosamente con ID:", ventaId)
       } else {
         throw new Error('No se pudo obtener el ID de la venta')
       }

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
      setClienteSeleccionado(null)
      setMostrarSugerenciasClientes(false)
      setMostrarListaClientes(false)
      setNotaVenta("")
      setFactura("")
      setSkuInput("")
      setCantidadInput("1")
      // Limpiar campos del gestor de clientes
      setNuevoClienteNombre("")
      setNuevoClienteTelefono("")
      setNuevoClienteEmail("")

      alert("Venta registrada exitosamente")

    } catch (error) {
      console.error('Error al registrar venta:', error)
      alert('Error al registrar la venta')
    } finally {
      setProcesandoVenta(false)
    }
  }

  const totales = calcularTotales()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black">Punto de Venta</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
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
            <CardTitle className="text-black flex items-center justify-between">
              Seleccionar Vendedor
              <Button
                onClick={() => setMostrarGestionVendedores(!mostrarGestionVendedores)}
                variant="outline"
                size="sm"
                className="bg-white border-gray-300 text-black hover:bg-gray-50"
              >
                <Users className="h-4 w-4 mr-2" />
                Gestionar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap mb-4">
              {vendedoresFiltrados.map((vendedor) => (
                <div key={vendedor.id} className="flex items-center gap-1">
                  <Button
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
                  {mostrarGestionVendedores && (
                    <Button
                      onClick={() => eliminarVendedor(vendedor.id, vendedor.nombre)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                      disabled={loading}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {mostrarGestionVendedores && (
              <div className="border-t pt-4">
                <div className="flex gap-2">
                  <Input
                    value={nuevoVendedorNombre}
                    onChange={(e) => setNuevoVendedorNombre(e.target.value)}
                    placeholder={`Nombre del nuevo vendedor para ${tiendaVenta}`}
                    className="bg-white border-gray-300 text-black placeholder:text-gray-400"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        crearVendedor()
                      }
                    }}
                  />
                  <Button
                    onClick={crearVendedor}
                    disabled={loading || !nuevoVendedorNombre.trim()}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
                
                {/* Mensajes de error y éxito */}
                {errorMessage && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    {errorMessage}
                  </div>
                )}
                {successMessage && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                    {successMessage}
                  </div>
                )}
              </div>
            )}

            {loading && (
              <div className="text-center text-gray-500 mt-2">
                Cargando...
              </div>
            )}
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
              <div className="flex gap-2">
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
                  className="bg-white border-gray-300 text-black placeholder:text-gray-400 flex-1"
                />
                <Button
                  onClick={activarEscaner}
                  variant="outline"
                  size="icon"
                  className="bg-white border-gray-300 text-black hover:bg-gray-50"
                  title="Activar escáner de códigos de barras"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
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

          {/* Modal del escáner de códigos de barras */}
          {mostrarEscaner && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-black">Escáner de Códigos de Barras</h3>
                  <Button
                    onClick={desactivarEscaner}
                    variant="ghost"
                    size="icon"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Apunta la cámara hacia el código de barras para escanearlo
                  </p>
                  
                  {escanerActivo && (
                    <div className="relative">
                      <Scanner
                        onScan={manejarEscaneo}
                        onError={manejarErrorEscaner}
                        constraints={{
                          facingMode: 'environment' // Usar cámara trasera en móviles
                        }}
                        formats={[
                          'qr_code',
                          'ean_13',
                          'ean_8',
                          'code_128',
                          'code_39',
                          'upc_a',
                          'upc_e',
                          'codabar',
                          'itf',
                          'databar',
                          'databar_expanded'
                        ]}
                        components={{
                          finder: true  // Mostrar el marco de enfoque
                        }}
                        styles={{
                          container: {
                            width: '100%',
                            height: '300px',
                            borderRadius: '8px',
                            overflow: 'hidden'
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={desactivarEscaner}
                    variant="outline"
                    className="flex-1 bg-white border-gray-300 text-black hover:bg-gray-50"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}
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
                      <TableCell className="text-right text-gray-600">{formatCurrency(item.costo)}</TableCell>
                      <TableCell className="text-right text-black">{formatCurrency(item.precio)}</TableCell>
                      <TableCell className="text-right text-green-600">{formatCurrency(item.utilidad)}</TableCell>
                      <TableCell className="text-right text-black font-semibold">
                        {formatCurrency(item.precio * item.cantidad)}
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
                    <TableCell className="text-right font-bold text-black">{formatCurrency(totales.ventaTotal)}</TableCell>
                    <TableCell />
                  </TableRow>
                  <TableRow className="border-gray-200 bg-gray-50">
                    <TableCell colSpan={7} className="text-right text-gray-600">
                      Costo Total:
                    </TableCell>
                    <TableCell className="text-right text-gray-600">{formatCurrency(totales.costoTotal)}</TableCell>
                    <TableCell />
                  </TableRow>
                  <TableRow className="border-gray-200 bg-gray-50">
                    <TableCell colSpan={7} className="text-right text-gray-600">
                      Utilidad Total:
                    </TableCell>
                    <TableCell className="text-right text-green-600 font-semibold">
                      {formatCurrency(totales.utilidadTotal)}
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
          <CardTitle className="text-black flex items-center justify-between">
            Información de la Venta
            <Button
              onClick={() => setMostrarGestionClientes(!mostrarGestionClientes)}
              variant="outline"
              size="sm"
              className="bg-white border-gray-300 text-black hover:bg-gray-50"
            >
              <Users className="h-4 w-4 mr-2" />
              Gestionar Clientes
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2 relative">
              <Label htmlFor="cliente" className="text-black">
                Cliente
              </Label>
              <div className="relative">
                <Input
                  id="cliente"
                  value={cliente}
                  onChange={(e) => manejarCambioCliente(e.target.value)}
                  placeholder="Buscar cliente o escribir nombre nuevo"
                  className="bg-white border-gray-300 text-black placeholder:text-gray-400 pr-10"
                  onFocus={() => {
                    if (cliente.length >= 2) {
                      buscarClientes(cliente)
                      setMostrarSugerenciasClientes(true)
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => setMostrarSugerenciasClientes(false), 200)
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                  onClick={abrirListaClientes}
                  onBlur={cerrarListaClientes}
                >
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
              
              {/* Lista desplegable de clientes */}
              {mostrarListaClientes && (
                <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                  <div
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-blue-600 border-b border-gray-100 font-medium"
                    onClick={crearNuevoClienteDesdeDropdown}
                  >
                    <div className="flex items-center">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear nuevo cliente
                    </div>
                  </div>
                  {clientesSugeridos.map((clienteSugerido) => (
                    <div
                      key={clienteSugerido.id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-black border-b border-gray-100 last:border-b-0"
                      onClick={() => {
                        seleccionarCliente(clienteSugerido)
                        setMostrarListaClientes(false)
                      }}
                    >
                      <div className="font-medium">{clienteSugerido.nombre}</div>
                      {clienteSugerido.telefono && (
                        <div className="text-sm text-gray-600">{clienteSugerido.telefono}</div>
                      )}
                      {clienteSugerido.email && (
                        <div className="text-sm text-gray-500">{clienteSugerido.email}</div>
                      )}
                    </div>
                  ))}
                  {clientesSugeridos.length === 0 && (
                    <div className="px-3 py-2 text-gray-500 text-center">
                      No hay clientes registrados
                    </div>
                  )}
                </div>
              )}
              
              {/* Sugerencias de autocompletado */}
              {mostrarSugerenciasClientes && clientesSugeridos.length > 0 && !mostrarListaClientes && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto">
                  {clientesSugeridos.map((clienteSugerido) => (
                    <div
                      key={clienteSugerido.id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-black border-b border-gray-100 last:border-b-0"
                      onClick={() => seleccionarCliente(clienteSugerido)}
                    >
                      <div className="font-medium">{clienteSugerido.nombre}</div>
                      {clienteSugerido.telefono && (
                        <div className="text-sm text-gray-600">{clienteSugerido.telefono}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Gestión de Clientes */}
            {mostrarGestionClientes && (
              <div className="col-span-full bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-black mb-4">Gestión de Clientes</h3>
                
                {/* Formulario para nuevo cliente */}
                <div className="grid lg:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label className="text-black">Nombre *</Label>
                    <Input
                      value={nuevoClienteNombre}
                      onChange={(e) => setNuevoClienteNombre(e.target.value)}
                      placeholder="Nombre del cliente"
                      className="bg-white border-gray-300 text-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-black">Teléfono</Label>
                    <Input
                      value={nuevoClienteTelefono}
                      onChange={(e) => setNuevoClienteTelefono(e.target.value)}
                      placeholder="Teléfono del cliente"
                      className="bg-white border-gray-300 text-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-black">Email</Label>
                    <Input
                      value={nuevoClienteEmail}
                      onChange={(e) => setNuevoClienteEmail(e.target.value)}
                      placeholder="Email del cliente"
                      type="email"
                      className="bg-white border-gray-300 text-black"
                    />
                  </div>

                </div>
                
                <Button
                  onClick={crearClienteCompleto}
                  disabled={!nuevoClienteNombre.trim()}
                  className="mb-4 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Cliente
                </Button>

                {/* Lista de clientes existentes */}
                <div className="max-h-60 overflow-y-auto">
                  <h4 className="font-medium text-black mb-2">Clientes Existentes ({clientesList.length})</h4>
                  <div className="space-y-2">
                    {clientesList.map((cliente) => (
                      <div
                        key={cliente.id}
                        className="flex items-center justify-between bg-white p-3 rounded border border-gray-200"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-black">{cliente.nombre}</div>
                          <div className="text-sm text-gray-600">
                            {cliente.telefono && `Tel: ${cliente.telefono}`}
                            {cliente.email && ` | Email: ${cliente.email}`}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => seleccionarCliente(cliente)}
                            variant="outline"
                            size="sm"
                            className="bg-white border-gray-300 text-black hover:bg-gray-50"
                          >
                            Seleccionar
                          </Button>
                          <Button
                            onClick={() => eliminarCliente(cliente.id, cliente.nombre)}
                            variant="outline"
                            size="sm"
                            className="bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

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

          <div className="grid lg:grid-cols-2 gap-4">
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
            <Button 
              onClick={registrarVenta} 
              disabled={procesandoVenta}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {procesandoVenta ? "Procesando..." : "Registrar Venta"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
