import type { Producto, Equipo, InventarioItem, Vendedor, Venta } from "./types"

export const productos: Producto[] = [
  {
    id: "1",
    sku: "MRC4K2E",
    nombre: "Control Remoto Universal",
    categoria: "Controles",
    costo: 174,
    precio: 500,
    utilidad: 326,
  },
  {
    id: "2",
    sku: "CAP_ARRANQUE_2",
    nombre: "Capacitor de Arranque",
    categoria: "Misceláneos",
    costo: 150,
    precio: 400,
    utilidad: 250,
  },
  {
    id: "3",
    sku: "MOT_VENT_1",
    nombre: "Motor de Ventilador",
    categoria: "Motores de Evaporador",
    costo: 850,
    precio: 1800,
    utilidad: 950,
  },
]

export const equipos: Equipo[] = [
  {
    id: "1",
    sku: "CLF120TL",
    nombre: "LIFE 12+ CONV",
    modelo: "LIFE12+",
    tecnologia: "Convencional",
    btu: 12000,
    voltaje: 115,
    costo: 4192,
    precio: 5600,
    utilidad: 1408,
  },
  {
    id: "2",
    sku: "CLF121TL",
    nombre: "LIFE 12+ CONV",
    modelo: "LIFE12+",
    tecnologia: "Convencional",
    btu: 12000,
    voltaje: 220,
    costo: 4124,
    precio: 5500,
    utilidad: 1376,
  },
  {
    id: "3",
    sku: "CHF181S",
    nombre: "NEX 2023 CONV",
    modelo: "NEX 2023",
    tecnologia: "Convencional",
    btu: 18000,
    voltaje: 220,
    costo: 5570,
    precio: 7700,
    utilidad: 2130,
  },
  {
    id: "4",
    sku: "CLF261J",
    nombre: "XLIFE CONV",
    modelo: "XLIFE",
    tecnologia: "Convencional",
    btu: 24000,
    voltaje: 220,
    costo: 8735,
    precio: 10200,
    utilidad: 1465,
  },
]

export const inventarioProductos: InventarioItem[] = [
  { productoId: "1", cantidadCancun: 15, cantidadPlaya: 8 },
  { productoId: "2", cantidadCancun: 25, cantidadPlaya: 12 },
  { productoId: "3", cantidadCancun: 10, cantidadPlaya: 5 },
]

export const inventarioEquipos: InventarioItem[] = [
  { productoId: "1", cantidadCancun: 5, cantidadPlaya: 3 },
  { productoId: "2", cantidadCancun: 4, cantidadPlaya: 2 },
  { productoId: "3", cantidadCancun: 3, cantidadPlaya: 2 },
  { productoId: "4", cantidadCancun: 2, cantidadPlaya: 1 },
]

export const vendedores: Vendedor[] = [
  { id: "1", nombre: "Ana G.", tienda: "Cancún" },
  { id: "2", nombre: "Luis F.", tienda: "Cancún" },
  { id: "3", nombre: "Sofía R.", tienda: "Playa del Carmen" },
  { id: "4", nombre: "Carlos T.", tienda: "Playa del Carmen" },
  { id: "5", nombre: "Pedro G.", tienda: "Playa del Carmen" },
]
