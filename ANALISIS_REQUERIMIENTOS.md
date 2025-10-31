# ANÁLISIS DE REQUERIMIENTOS DE SOFTWARE
## Sistema POS Mirage - Gestión de Inventario y Ventas

---

## 1. INFORMACIÓN GENERAL DEL PROYECTO

### 1.1 Descripción del Sistema
**POS Mirage** es un sistema integral de punto de venta diseñado para la gestión de inventarios y ventas de equipos de aire acondicionado y refacciones. El sistema está optimizado para operar en dos ubicaciones: Cancún y Playa del Carmen.

### 1.2 Alcance del Sistema
- Gestión de inventarios (equipos y refacciones)
- Procesamiento de ventas
- Administración de clientes y vendedores
- Generación de reportes y estadísticas
- Generación de etiquetas con códigos de barras
- **Funcionalidad futura**: Escaneo de códigos de barras con cámara

### 1.3 Usuarios del Sistema
- **Vendedores**: Personal de ventas de ambas tiendas
- **Administradores**: Gestión completa del sistema
- **Gerentes**: Acceso a reportes y estadísticas

---

## 2. REQUERIMIENTOS FUNCIONALES

### 2.1 Módulo de Autenticación (RF-001)
**Descripción**: Sistema básico de autenticación para acceso al sistema.

Este módulo proporciona la seguridad fundamental del sistema mediante un mecanismo de autenticación simple pero efectivo. Permite controlar el acceso a todas las funcionalidades del POS, asegurando que solo usuarios autorizados puedan operar el sistema. La implementación actual utiliza un sistema de login básico que mantiene la sesión del usuario durante su uso, proporcionando una experiencia fluida sin comprometer la seguridad. Es el punto de entrada obligatorio para cualquier operación dentro del sistema.

**Funcionalidades**:
- **RF-001.1**: Login con usuario y contraseña
- **RF-001.2**: Validación de credenciales
- **RF-001.3**: Mantenimiento de sesión activa
- **RF-001.4**: Logout del sistema

**Prioridad**: Alta
**Estado**: Implementado (básico)

### 2.2 Módulo de Gestión de Inventario - Refacciones (RF-002)
**Descripción**: Administración completa del inventario de refacciones.

Este módulo constituye el corazón del sistema de gestión de inventarios, específicamente diseñado para manejar refacciones de aires acondicionados. Permite un control granular de cada producto, incluyendo la gestión de precios, costos y cantidades por ubicación geográfica. La funcionalidad de edición en línea facilita actualizaciones rápidas durante las operaciones diarias, mientras que el sistema de categorización organiza los productos de manera lógica. El cálculo automático de utilidades proporciona información financiera instantánea, crucial para la toma de decisiones comerciales.

**Funcionalidades**:
- **RF-002.1**: Visualización de inventario de refacciones
- **RF-002.2**: Edición en línea de costos y precios
- **RF-002.3**: Actualización de cantidades por tienda (Cancún/Playa del Carmen)
- **RF-002.4**: Cálculo automático de utilidades
- **RF-002.5**: Filtrado y búsqueda de productos
- **RF-002.6**: Categorización por tipo (Controles, Misceláneos, Motores de Evaporador)

**Prioridad**: Alta
**Estado**: Implementado

### 2.3 Módulo de Gestión de Inventario - Equipos (RF-003)
**Descripción**: Administración del inventario de equipos de aire acondicionado.

Este módulo especializado maneja el inventario de equipos completos de aire acondicionado, diferenciándose del módulo de refacciones por la complejidad y especificaciones técnicas de los productos. Permite gestionar equipos de diferentes modelos y tecnologías, manteniendo un control detallado de las especificaciones técnicas como BTU y voltaje, información crucial para las ventas. La clasificación por tecnología (Convencional vs Inverter) facilita la búsqueda y recomendación de productos según las necesidades del cliente. El control por tienda asegura disponibilidad precisa en cada ubicación.

**Funcionalidades**:
- **RF-003.1**: Gestión de equipos por modelo (LIFE12+, NEX 2023, XLIFE)
- **RF-003.2**: Clasificación por tecnología (Convencional, Inverter)
- **RF-003.3**: Especificaciones técnicas (BTU, voltaje)
- **RF-003.4**: Control de inventario por tienda
- **RF-003.5**: Edición de precios y costos
- **RF-003.6**: Eliminación de equipos con confirmación

**Prioridad**: Alta
**Estado**: Implementado

### 2.4 Módulo de Agregar Productos (RF-004)
**Descripción**: Funcionalidad para agregar nuevos productos al inventario.

Este módulo facilita la expansión del catálogo de productos mediante formularios intuitivos y validaciones automáticas. Está diseñado para minimizar errores durante la captura de datos y automatizar procesos como la generación de SKU y cálculo de utilidades. La integración directa con Supabase asegura que los nuevos productos estén inmediatamente disponibles en todo el sistema. Los formularios diferenciados para refacciones y equipos reconocen las distintas necesidades de información para cada tipo de producto, optimizando la experiencia del usuario.

**Funcionalidades**:
- **RF-004.1**: Formulario de alta de refacciones
- **RF-004.2**: Formulario de alta de equipos
- **RF-004.3**: Validación de datos obligatorios
- **RF-004.4**: Generación automática de SKU
- **RF-004.5**: Cálculo automático de utilidades
- **RF-004.6**: Integración con base de datos Supabase

**Prioridad**: Alta
**Estado**: Implementado

### 2.5 Módulo de Punto de Venta (RF-005)
**Descripción**: Sistema completo de procesamiento de ventas.

Este es el módulo más crítico del sistema, donde se materializa toda la operación comercial. Integra todos los componentes del sistema (inventarios, clientes, vendedores) en un flujo de trabajo optimizado para maximizar la eficiencia de las ventas. El sistema de carrito permite construir ventas complejas con múltiples productos, mientras que la gestión de clientes facilita el seguimiento de la base de clientes. Los múltiples métodos de pago se adaptan a las preferencias del mercado mexicano, y la validación de inventario previene sobreventa. La generación automática de documentos y el cálculo de utilidades proporcionan información financiera inmediata.

**Funcionalidades**:
- **RF-005.1**: Selección de tienda (Cancún/Playa del Carmen)
- **RF-005.2**: Gestión de vendedores por tienda
- **RF-005.3**: Carrito de compras con productos y equipos
- **RF-005.4**: Gestión de clientes (crear, buscar, seleccionar)
- **RF-005.5**: Múltiples métodos de pago (Efectivo, Tarjeta, Transferencia)
- **RF-005.6**: Generación de notas de venta y facturas
- **RF-005.7**: Cálculo automático de totales y utilidades
- **RF-005.8**: Persistencia de ventas en base de datos
- **RF-005.9**: Validación de inventario disponible

**Prioridad**: Alta
**Estado**: Implementado

### 2.6 Módulo de Historial de Ventas (RF-006)
**Descripción**: Visualización y análisis de ventas realizadas.

Este módulo transforma los datos de ventas en información estratégica para la toma de decisiones. Proporciona una vista retrospectiva completa de la actividad comercial, permitiendo identificar patrones, tendencias y oportunidades de mejora. Los filtros avanzados facilitan análisis específicos por diferentes criterios, mientras que las visualizaciones gráficas hacen la información más accesible. Las métricas de rendimiento por vendedor fomentan la competencia sana y permiten identificar mejores prácticas. Es una herramienta fundamental para la gestión estratégica del negocio.

**Funcionalidades**:
- **RF-006.1**: Listado de ventas por fecha
- **RF-006.2**: Filtrado por tienda
- **RF-006.3**: Búsqueda por vendedor, cliente o número de venta
- **RF-006.4**: Visualización de detalles de venta
- **RF-006.5**: Gráficos estadísticos (barras, pie)
- **RF-006.6**: Métricas de rendimiento por vendedor
- **RF-006.7**: Análisis de métodos de pago

**Prioridad**: Media
**Estado**: Implementado

### 2.7 Módulo de Generador de Etiquetas (RF-007)
**Descripción**: Creación y exportación de etiquetas con códigos de barras.

Este módulo complementa la gestión de inventarios proporcionando herramientas para crear etiquetas profesionales con códigos de barras. Utiliza el estándar Code 128 para asegurar compatibilidad con la mayoría de lectores de códigos de barras del mercado. La funcionalidad de vista previa permite verificar el diseño antes de la impresión, evitando desperdicios de material. La exportación a PDF facilita la impresión en cualquier impresora estándar, mientras que el diseño personalizable permite adaptar las etiquetas a las necesidades específicas del negocio. Es una herramienta esencial para la organización física del inventario.

**Funcionalidades**:
- **RF-007.1**: Formulario de datos para etiquetas
- **RF-007.2**: Generación de códigos de barras (Code 128)
- **RF-007.3**: Vista previa de etiquetas
- **RF-007.4**: Exportación a PDF
- **RF-007.5**: Diseño personalizable de etiquetas

**Prioridad**: Media
**Estado**: Implementado

### 2.8 Módulo de Escaneo de Códigos de Barras (RF-008)
**Descripción**: Funcionalidad de escaneo con cámara (implementación futura).

Este módulo representa la evolución natural del sistema hacia una operación más eficiente y moderna. Aprovechará las capacidades de cámara de dispositivos móviles y tablets para acelerar significativamente el proceso de búsqueda y selección de productos durante las ventas. La detección automática eliminará errores de captura manual y reducirá el tiempo de procesamiento de cada venta. La integración directa con el punto de venta creará un flujo de trabajo fluido desde el escaneo hasta la facturación. Aunque actualmente en desarrollo, la infraestructura ya está preparada para su implementación.

**Funcionalidades**:
- **RF-008.1**: Activación de cámara del dispositivo
- **RF-008.2**: Detección automática de códigos de barras
- **RF-008.3**: Búsqueda automática de productos
- **RF-008.4**: Integración con punto de venta
- **RF-008.5**: Soporte para múltiples formatos de códigos

**Prioridad**: Media
**Estado**: Preparado (infraestructura implementada)

---

## 3. REQUERIMIENTOS NO FUNCIONALES

### 3.1 Rendimiento (RNF-001)
**Descripción**: Especificaciones de rendimiento para garantizar una experiencia de usuario óptima.

El rendimiento del sistema es crucial para mantener la productividad durante las operaciones de venta. Los tiempos de respuesta rápidos aseguran que los vendedores puedan atender eficientemente a los clientes sin demoras frustrantes. La capacidad de soporte concurrente permite operaciones simultáneas en ambas tiendas durante períodos de alta demanda. La optimización móvil reconoce la tendencia hacia el uso de tablets y smartphones en entornos comerciales, mientras que la carga inicial rápida minimiza el tiempo de inactividad durante el inicio de operaciones diarias.

- **RNF-001.1**: Tiempo de respuesta máximo de 3 segundos para consultas
- **RNF-001.2**: Soporte para hasta 100 usuarios concurrentes
- **RNF-001.3**: Optimización para dispositivos móviles
- **RNF-001.4**: Carga inicial de la aplicación en menos de 5 segundos

### 3.2 Usabilidad (RNF-002)
**Descripción**: Criterios de experiencia de usuario para facilitar la adopción y uso eficiente del sistema.

La usabilidad determina la velocidad de adopción y la eficiencia operativa del sistema. Una interfaz responsive asegura consistencia de experiencia independientemente del dispositivo utilizado. La navegación intuitiva reduce la curva de aprendizaje para nuevos usuarios, mientras que el feedback visual proporciona confirmación inmediata de las acciones realizadas. Los mensajes de error claros facilitan la resolución de problemas, y las confirmaciones previenen errores costosos durante operaciones críticas como eliminaciones o modificaciones importantes.

- **RNF-002.1**: Interfaz responsive para desktop y móvil
- **RNF-002.2**: Navegación intuitiva con menú lateral
- **RNF-002.3**: Feedback visual para todas las acciones
- **RNF-002.4**: Mensajes de error claros y descriptivos
- **RNF-002.5**: Confirmaciones para acciones destructivas

### 3.3 Confiabilidad (RNF-003)
**Descripción**: Garantías de disponibilidad y recuperación del sistema para asegurar continuidad operativa.

La confiabilidad es fundamental para un sistema de punto de venta, donde las interrupciones pueden resultar en pérdida directa de ventas. El alto nivel de disponibilidad asegura que el sistema esté operativo durante las horas críticas de negocio. Los backups automáticos protegen contra pérdida de datos por fallos técnicos o errores humanos. La capacidad de recuperación rápida minimiza el impacto de cualquier interrupción, mientras que la validación de integridad asegura la consistencia y precisión de la información comercial y financiera.

- **RNF-003.1**: Disponibilidad del 99.5%
- **RNF-003.2**: Backup automático de datos
- **RNF-003.3**: Recuperación ante fallos en menos de 1 hora
- **RNF-003.4**: Validación de integridad de datos

### 3.4 Seguridad (RNF-004)
**Descripción**: Medidas de protección para salvaguardar datos comerciales y prevenir accesos no autorizados.

La seguridad es crítica en un sistema que maneja información comercial sensible, incluyendo precios, costos, utilidades y datos de clientes. La autenticación obligatoria establece la primera línea de defensa, mientras que HTTPS protege la transmisión de datos. La validación de entrada previene ataques de inyección y manipulación de datos. La protección contra inyección SQL y el Row Level Security en la base de datos proporcionan capas adicionales de seguridad, asegurando que solo usuarios autorizados puedan acceder a información específica según sus permisos.

- **RNF-004.1**: Autenticación obligatoria para acceso
- **RNF-004.2**: Conexión HTTPS en producción
- **RNF-004.3**: Validación de datos de entrada
- **RNF-004.4**: Protección contra inyección SQL
- **RNF-004.5**: Row Level Security (RLS) en base de datos

### 3.5 Escalabilidad (RNF-005)
**Descripción**: Capacidad del sistema para crecer y adaptarse a necesidades futuras del negocio.

La escalabilidad asegura que la inversión en el sistema se mantenga viable a medida que el negocio crece. La arquitectura modular facilita la adición de nuevas funcionalidades sin afectar las existentes. La base de datos escalable de Supabase puede manejar el crecimiento en volumen de datos y usuarios. La capacidad de agregar nuevas tiendas permite expansión geográfica, mientras que el soporte para nuevos tipos de productos facilita la diversificación del catálogo sin requerir cambios arquitectónicos significativos.

- **RNF-005.1**: Arquitectura modular para fácil extensión
- **RNF-005.2**: Base de datos escalable (Supabase)
- **RNF-005.3**: Posibilidad de agregar nuevas tiendas
- **RNF-005.4**: Soporte para nuevos tipos de productos

### 3.6 Compatibilidad (RNF-006)
**Descripción**: Garantías de funcionamiento en diferentes plataformas y dispositivos.

La compatibilidad amplia maximiza la accesibilidad del sistema y reduce las barreras de adopción. El soporte para navegadores modernos asegura que los usuarios puedan acceder desde cualquier computadora actualizada. La compatibilidad móvil reconoce la importancia de dispositivos portátiles en entornos comerciales modernos. El diseño responsive garantiza una experiencia consistente independientemente del tamaño de pantalla, mientras que el soporte para cámaras móviles habilita funcionalidades futuras de escaneo de códigos de barras.

- **RNF-006.1**: Soporte para navegadores modernos (Chrome, Firefox, Safari, Edge)
- **RNF-006.2**: Compatibilidad con dispositivos móviles (iOS, Android)
- **RNF-006.3**: Responsive design para diferentes tamaños de pantalla
- **RNF-006.4**: Soporte para cámaras de dispositivos móviles

### 3.7 Mantenibilidad (RNF-007)
**Descripción**: Características que facilitan el mantenimiento, actualización y evolución del sistema.

La mantenibilidad determina el costo total de propiedad del sistema a largo plazo. El uso de TypeScript con tipado estricto reduce errores y facilita refactorizaciones seguras. La arquitectura de componentes reutilizables minimiza la duplicación de código y acelera el desarrollo de nuevas funcionalidades. La documentación técnica actualizada facilita la incorporación de nuevos desarrolladores y el mantenimiento por parte del equipo actual. Los logs detallados permiten diagnóstico rápido de problemas y monitoreo del rendimiento del sistema.

- **RNF-007.1**: Código TypeScript con tipado estricto
- **RNF-007.2**: Arquitectura de componentes reutilizables
- **RNF-007.3**: Documentación técnica actualizada
- **RNF-007.4**: Logs de errores y actividades

---

## 4. ARQUITECTURA Y TECNOLOGÍAS

### 4.1 Arquitectura del Sistema
**Patrón**: Single Page Application (SPA) con arquitectura de componentes

**Capas**:
- **Presentación**: Componentes React con TypeScript
- **Lógica de Negocio**: Hooks personalizados y utilidades
- **Datos**: Supabase (PostgreSQL) con cliente JavaScript
- **Infraestructura**: Vercel para deployment

### 4.2 Stack Tecnológico

#### Frontend
- **Framework**: Next.js 15.2.4
- **Lenguaje**: TypeScript 5.x
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4.1.9
- **Componentes**: Radix UI + shadcn/ui
- **Iconos**: Lucide React
- **Gráficos**: Recharts
- **Códigos de Barras**: JsBarcode
- **PDF**: jsPDF + html2canvas
- **Escaneo**: QuaggaJS

#### Backend/Base de Datos
- **BaaS**: Supabase
- **Base de Datos**: PostgreSQL
- **Autenticación**: Supabase Auth
- **API**: REST API automática
- **Tiempo Real**: Supabase Realtime

#### Deployment
- **Hosting**: Vercel
- **CI/CD**: Automático con Git
- **Analytics**: Vercel Analytics
- **Dominio**: Personalizable

### 4.3 Estructura de Base de Datos

#### Tablas Principales
1. **vendedores**
   - id, nombre, email, telefono, tienda, activo, created_at, updated_at

2. **clientes**
   - id, nombre, telefono, email, created_at, updated_at

3. **refacciones**
   - id, sku, nombre, categoria, costo, precio, cantidad_cancun, cantidad_playa

4. **equipos**
   - id, sku, nombre, modelo, tecnologia, btu, voltaje, costo, precio, cantidad_cancun, cantidad_playa

5. **ventas**
   - id, fecha, nota_venta, factura, cliente, vendedor, tienda, metodo_pago, tipo_tarjeta, costo_total, venta_total, utilidad_total

6. **venta_items**
   - id, venta_id, producto_id, sku, nombre, tipo, cantidad, costo, precio, utilidad

#### Catálogos
- **catalogo_modelos**: Modelos de equipos disponibles
- **catalogo_categorias**: Categorías de refacciones

---

## 5. CASOS DE USO PRINCIPALES

### 5.1 Realizar una Venta
**Actor**: Vendedor
**Precondiciones**: Usuario autenticado, productos en inventario
**Flujo Principal**:
1. Seleccionar tienda y vendedor
2. Agregar productos/equipos al carrito
3. Seleccionar o crear cliente
4. Elegir método de pago
5. Confirmar venta
6. Generar nota de venta

### 5.2 Gestionar Inventario
**Actor**: Administrador
**Precondiciones**: Usuario autenticado con permisos
**Flujo Principal**:
1. Acceder al módulo de inventario
2. Buscar producto específico
3. Editar precios, costos o cantidades
4. Guardar cambios en base de datos

### 5.3 Generar Reportes de Ventas
**Actor**: Gerente
**Precondiciones**: Ventas registradas en el sistema
**Flujo Principal**:
1. Acceder al historial de ventas
2. Aplicar filtros (fecha, tienda, vendedor)
3. Visualizar estadísticas y gráficos
4. Analizar rendimiento

---

## 6. RESTRICCIONES Y LIMITACIONES

### 6.1 Restricciones Técnicas
- Dependencia de conexión a internet para Supabase
- Limitaciones de la cámara del dispositivo para escaneo
- Compatibilidad con navegadores que soporten WebRTC

### 6.2 Restricciones de Negocio
- Sistema limitado a dos tiendas (Cancún y Playa del Carmen)
- Productos específicos del sector HVAC
- Moneda fija en pesos mexicanos

### 6.3 Limitaciones Actuales
- Autenticación básica sin roles diferenciados
- Sin sincronización offline
- Escaneo de códigos de barras en desarrollo

---

## 7. CRITERIOS DE ACEPTACIÓN

### 7.1 Funcionales
- ✅ Todas las operaciones CRUD funcionan correctamente
- ✅ Cálculos de precios y utilidades son precisos
- ✅ Integración con Supabase es estable
- ✅ Generación de PDFs funciona en todos los navegadores
- 🔄 Escaneo de códigos de barras (en desarrollo)

### 7.2 No Funcionales
- ✅ Interfaz responsive en dispositivos móviles y desktop
- ✅ Tiempo de carga inicial menor a 5 segundos
- ✅ Navegación intuitiva y fluida
- ✅ Manejo de errores con mensajes claros

---

## 8. PLAN DE IMPLEMENTACIÓN FUTURO

### 8.1 Fase 1: Optimización Actual
- Mejoras en el escaneo de códigos de barras
- Optimización de rendimiento móvil
- Implementación de roles de usuario

### 8.2 Fase 2: Funcionalidades Avanzadas
- Sincronización offline
- Reportes avanzados con exportación
- Integración con sistemas de facturación

### 8.3 Fase 3: Escalabilidad
- Soporte para múltiples tiendas
- API para integraciones externas
- Dashboard de analytics avanzado

---

## 9. CONCLUSIONES

El sistema **POS Mirage** representa una solución integral y moderna para la gestión de inventarios y ventas en el sector HVAC. Con una arquitectura sólida basada en tecnologías actuales y una base de datos robusta, el sistema cumple con los requerimientos funcionales y no funcionales establecidos.

La implementación actual proporciona una base sólida para futuras expansiones, especialmente en el área de escaneo de códigos de barras, que mejorará significativamente la eficiencia operativa del sistema.

**Estado del Proyecto**: ✅ Funcional y en producción
**Próximos Pasos**: Implementación completa del escaneo de códigos de barras

---

*Documento generado automáticamente basado en el análisis del código fuente*
*Fecha: Enero 2025*
*Versión: 1.0*