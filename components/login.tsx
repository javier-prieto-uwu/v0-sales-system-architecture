"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface LoginProps {
  onLogin: () => void
}

export function Login({ onLogin }: LoginProps) {
  const [usuario, setUsuario] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin()
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
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Iniciar Sesión
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
