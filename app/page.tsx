"use client"

import { useState } from "react"
import { Login } from "@/components/login"
import { Navigation } from "@/components/navigation"
import { Inventario } from "@/components/inventario"
import { InventarioEquipos } from "@/components/inventario-equipos"
import { AgregarProducto } from "@/components/agregar-producto"
import { PuntoVenta } from "@/components/punto-venta"
import { HistorialVentas } from "@/components/historial-ventas"
import { GeneradorEtiquetas } from "@/components/generador-etiquetas"
import { HacerInventario } from "@/components/hacerinventario"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeSection, setActiveSection] = useState("inventario")

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeSection={activeSection} onNavigate={setActiveSection} />
      <main className="max-w-7xl mx-auto p-6">
        {activeSection === "inventario" && <Inventario />}
        {activeSection === "equipos" && <InventarioEquipos />}
        {activeSection === "agregar" && <AgregarProducto />}
        {activeSection === "venta" && <PuntoVenta />}
        {activeSection === "hacerinventario" && <HacerInventario />}
        {activeSection === "historial" && <HistorialVentas />}
        {activeSection === "etiquetas" && <GeneradorEtiquetas />}
      </main>
    </div>
  )
}
