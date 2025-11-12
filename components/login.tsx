"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase, SUPABASE_IS_CONFIGURED } from "@/lib/supabaseClient"

interface LoginProps {
  onLogin: () => void
}

export function Login({ onLogin }: LoginProps) {
  const [usuario, setUsuario] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Si ya hay una sesión activa, entrar directamente
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        onLogin()
      }
    }
    checkSession()
  }, [onLogin])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Interpretar "usuario" como email (las cuentas las dan administradores)
    const email = usuario.trim()
    const pwd = password

    if (!email || !pwd) {
      setError("Ingresa usuario y contraseña")
      setLoading(false)
      return
    }

    // Validación de configuración para evitar llamadas a placeholder en producción
    if (!SUPABASE_IS_CONFIGURED) {
      setError("Variables de entorno de Supabase faltantes en el deployment. Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel.")
      setLoading(false)
      return
    }

    // Autenticación con Supabase
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pwd })
    if (error) {
      setError(error.message || "Error al iniciar sesión")
      setLoading(false)
      return
    }

    if (data.session) {
      onLogin()
    } else {
      setError("No se pudo iniciar sesión. Intenta nuevamente.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md bg-white border-gray-200">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center mb-2">
            <div className="h-16 w-16 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">M</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-black">Mirage</CardTitle>
          <CardDescription className="text-gray-600">Sistema de Gestión de Inventario y Ventas</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="usuario" className="text-sm font-medium text-black">
                Usuario
              </label>
              <Input
                id="usuario"
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ingresa tu usuario"
                className="bg-white border-gray-300 text-black placeholder:text-gray-400"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-black">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="bg-white border-gray-300 text-black placeholder:text-gray-400"
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm" role="alert">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
