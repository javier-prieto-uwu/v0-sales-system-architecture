export type Tienda = "Cancún" | "Playa del Carmen"

export type Categoria = "Controles" | "Misceláneos" | "Motores de Evaporador"

export type Tecnologia = "Convencional" | "Inverter"

export type Modelo = "LIFE12+" | "NEX 2023" | "XLIFE"

export type MetodoPago = "Efectivo" | "Tarjeta" | "Transferencia"

export type TipoTarjeta = "Débito" | "Crédito" | ""

export interface Producto {
  id: string
  sku: string
  nombre: string
  categoria: Categoria
  costo: number
  precio: number
  utilidad: number
}

export interface Equipo {
  id: string
  sku: string
  nombre: string
  modelo: Modelo
  tecnologia: Tecnologia
  btu: number
  voltaje: number
  costo: number
  precio: number
  utilidad: number
}

export interface InventarioItem {
  productoId: string
  cantidadCancun: number
  cantidadPlaya: number
}

export interface Vendedor {
  id: string
  nombre: string
  tienda: Tienda
}

export interface Cliente {
  id: string
  nombre: string
  telefono?: string
  email?: string
  direccion?: string
  created_at?: string
  updated_at?: string
}

export interface ItemCarrito {
  id: string
  tipo: "producto" | "equipo"
  sku: string
  nombre: string
  cantidad: number
  costo: number
  precio: number
  utilidad: number
  // Seriales por equipo (opcional, solo aplica para equipos)
  numeroEvaporador?: string
  numeroCondensador?: string
}

export interface Venta {
  id: string
  fecha: string
  nota_venta: string
  factura: string
  cliente: string
  vendedor: string
  tienda: Tienda
  metodo_pago: MetodoPago
  tipo_tarjeta: TipoTarjeta
  items?: ItemCarrito[]
  costo_total: number
  venta_total: number
  utilidad_total: number
  equipos_vendidos: number
  refacciones_vendidas: number
}

export interface Etiqueta {
  pieza: string
  descripcion: string
  cantidad: number
}
