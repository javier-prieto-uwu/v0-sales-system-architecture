-- Migración para agregar columna tienda a la tabla vendedores
-- Ejecutar este script en el SQL Editor de Supabase

-- Paso 1: Agregar la columna tienda con valor por defecto
ALTER TABLE public.vendedores 
ADD COLUMN tienda TEXT NOT NULL DEFAULT 'Cancún';

-- Paso 2: Actualizar los vendedores existentes para distribuirlos entre las tiendas
UPDATE public.vendedores 
SET tienda = CASE 
  WHEN id % 2 = 0 THEN 'Playa del Carmen'
  ELSE 'Cancún'
END;

-- Paso 3: Agregar constraint para validar valores de tienda
ALTER TABLE public.vendedores 
ADD CONSTRAINT vendedores_tienda_check 
CHECK (tienda IN ('Cancún', 'Playa del Carmen'));

-- Verificar la estructura actualizada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'vendedores' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar los datos actualizados
SELECT id, nombre, email, tienda, activo, created_at 
FROM public.vendedores 
ORDER BY tienda, nombre;