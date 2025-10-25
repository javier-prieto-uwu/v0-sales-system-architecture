import type { Vendedor } from "./types"

// Configuración del proyecto Supabase
const SUPABASE_PROJECT_ID = "invtoaqnuaxmsuvstysu"

// Función para obtener vendedores activos desde Supabase usando MCP
export async function obtenerVendedoresMCP(): Promise<Vendedor[]> {
  try {
    // Nota: En un entorno real, esto usaría las funciones MCP de Supabase
    // Por ahora mantenemos los datos de ejemplo hasta que se configure el MCP client
    const vendedoresData = [
      { id: "9", nombre: "bn,mn.m.mnbvnb", email: "bn,mn.m.mnbvnb@empresa.com", telefono: null, tienda: "Playa del Carmen" },
      { id: "8", nombre: "dfgdfgdfg", email: "dfgdfgdfg@empresa.com", telefono: null, tienda: "Playa del Carmen" },
      { id: "6", nombre: "fgdfg", email: "fgdfg@empresa.com", telefono: null, tienda: "Playa del Carmen" },
      { id: "7", nombre: "gfgfg", email: "gfgfg@empresa.com", telefono: null, tienda: "Cancún" }
    ]

    // Convertir a formato esperado por la aplicación
    const vendedores: Vendedor[] = vendedoresData.map(v => ({
      id: v.id,
      nombre: v.nombre,
      tienda: v.tienda as "Cancún" | "Playa del Carmen"
    }))

    return vendedores
  } catch (error) {
    console.error("Error obteniendo vendedores desde MCP:", error)
    throw error
  }
}

// Función para crear un nuevo vendedor usando MCP
export async function crearVendedorMCP(nombre: string, tienda: string): Promise<Vendedor> {
  try {
    // Simulamos la creación - en un entorno real esto sería una llamada MCP
    const nuevoVendedor: Vendedor = {
      id: Date.now().toString(), // ID temporal
      nombre: nombre,
      tienda: tienda as "Cancún" | "Playa del Carmen"
    }

    return nuevoVendedor
  } catch (error) {
    console.error("Error creando vendedor con MCP:", error)
    throw error
  }
}

// Función para eliminar un vendedor usando MCP
export async function eliminarVendedorMCP(vendedorId: string): Promise<void> {
  try {
    // Simulamos la eliminación - en un entorno real esto sería una llamada MCP
    console.log(`Eliminando vendedor con ID: ${vendedorId}`)
  } catch (error) {
    console.error("Error eliminando vendedor con MCP:", error)
    throw error
  }
}