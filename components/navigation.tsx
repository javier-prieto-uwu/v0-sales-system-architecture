"use client"

import { Package, Cpu, Plus, ShoppingCart, BarChart3, Tag } from "lucide-react"

interface NavigationProps {
  activeSection: string
  onNavigate: (section: string) => void
}

export function Navigation({ activeSection, onNavigate }: NavigationProps) {
  const sections = [
    { id: "inventario", label: "Inventario", icon: Package },
    { id: "equipos", label: "Equipos", icon: Cpu },
    { id: "agregar", label: "Agregar", icon: Plus },
    { id: "venta", label: "Punto de Venta", icon: ShoppingCart },
    { id: "historial", label: "Historial", icon: BarChart3 },
    { id: "etiquetas", label: "Etiquetas", icon: Tag },
  ]

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Cpu className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-black tracking-tight">MIRAGE</span>
            <span className="text-xs text-gray-500 font-mono">v1.0</span>
          </div>
          <div className="flex gap-1">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => onNavigate(section.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeSection === section.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:text-black hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {section.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
