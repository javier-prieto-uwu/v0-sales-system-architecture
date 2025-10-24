# Configuración de Supabase para POS Mirage

## Paso 1: Configurar variables de entorno

1. Crea un archivo `.env.local` en la raíz del proyecto
2. Copia el contenido de `.env.local.example` y completa con tus valores:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-aqui
```

## Paso 2: Crear la tabla vendedores

Ve a tu proyecto en Supabase Dashboard → SQL Editor y ejecuta este script:

```sql
-- Crear tabla vendedores
CREATE TABLE IF NOT EXISTS public.vendedores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tienda VARCHAR(50) NOT NULL CHECK (tienda IN ('Cancún', 'Playa del Carmen')),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar datos iniciales
INSERT INTO public.vendedores (nombre, tienda) VALUES
('Juan Pérez', 'Cancún'),
('María García', 'Cancún'),
('Carlos López', 'Playa del Carmen'),
('Ana Martínez', 'Playa del Carmen')
ON CONFLICT DO NOTHING;

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.vendedores ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir todas las operaciones
CREATE POLICY "Allow all operations on vendedores" ON public.vendedores
FOR ALL USING (true) WITH CHECK (true);
```

## Paso 3: Verificar la configuración

1. Reinicia el servidor de desarrollo: `npm run dev`
2. Ve a la sección "Punto de Venta"
3. Haz clic en "Gestionar" en la sección de vendedores
4. Intenta crear o eliminar un vendedor

## Solución de problemas

### Error: "Could not find the table 'public.vendedores'"
- Asegúrate de haber ejecutado el script SQL en Supabase
- Verifica que las variables de entorno estén configuradas correctamente
- Reinicia el servidor después de configurar las variables

### Error de conexión
- Verifica que la URL y la clave anónima sean correctas
- Asegúrate de que el proyecto de Supabase esté activo
- Revisa la consola del navegador para más detalles

### La aplicación usa datos locales
- Esto es normal si hay problemas de conexión
- La aplicación funcionará con datos hardcodeados como fallback
- Los cambios no se persistirán hasta que Supabase esté configurado