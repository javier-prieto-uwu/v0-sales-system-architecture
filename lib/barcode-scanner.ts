export interface ScannerConfig {
  onScanSuccess: (codigo: string) => void;
  onError: (error: string) => void;
  onStatusChange: (scanning: boolean) => void;
}

export interface DeviceInfo {
  isAndroid: boolean;
  isMobile: boolean;
  isHTTPS: boolean;
  isLocalhost: boolean;
}

export class BarcodeScanner {
  private videoRef: HTMLVideoElement | null = null;
  private streamActivo: MediaStream | null = null;
  private escaneando: boolean = false;
  private config: ScannerConfig;
  private detectionInterval: number | null = null;

  constructor(config: ScannerConfig) {
    this.config = config;
  }

  // Función para detectar si es un dispositivo móvil Android
  private esDispositivoAndroid(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    return /android/.test(userAgent);
  }

  // Función para detectar si es un dispositivo móvil
  private esDispositivoMovil(): boolean {
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent);
  }

  // Obtener información del dispositivo
  public getDeviceInfo(): DeviceInfo {
    const isLocalhost = location.hostname === 'localhost' || 
                       location.hostname === '127.0.0.1' ||
                       location.hostname === '::1';
    
    return {
      isAndroid: this.esDispositivoAndroid(),
      isMobile: this.esDispositivoMovil(),
      isHTTPS: location.protocol === 'https:',
      isLocalhost: isLocalhost
    };
  }

  // Verificar soporte de cámara (versión optimizada)
  private verificarSoporteCamara(): boolean {
    console.log('🔍 BarcodeScanner: Verificando soporte de cámara...');
    
    // Verificación simple: si hay navigator y alguna API de cámara
    if (!navigator) {
      console.error('❌ Navigator no disponible');
      return false;
    }

    // Verificar MediaDevices API (moderno) - corregido para evitar warning
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      console.log('✅ MediaDevices API disponible');
      return true;
    }

    // Verificar getUserMedia legacy
    const getUserMedia = (navigator as any).getUserMedia || 
                        (navigator as any).webkitGetUserMedia || 
                        (navigator as any).mozGetUserMedia;

    if (getUserMedia) {
      console.log('✅ getUserMedia legacy disponible');
      return true;
    }

    console.error('❌ No hay APIs de cámara disponibles');
    return false;
  }

  // Función de prueba simple para verificar acceso a cámara
  public async probarCamara(): Promise<string> {
    console.log('🧪 Iniciando prueba simple de cámara...');
    
    // Información del dispositivo
    const deviceInfo = this.getDeviceInfo();
    console.log('📱 Info del dispositivo:', deviceInfo);
    
    try {
      // Verificar que navigator existe
      if (!navigator) {
        return '❌ Navigator no disponible en este navegador';
      }
      
      // Verificar contexto seguro en móviles
      if (deviceInfo.isMobile && !deviceInfo.isHTTPS && !deviceInfo.isLocalhost) {
        return '❌ MÓVIL: Se requiere HTTPS para acceder a la cámara.\n\n💡 SOLUCIONES:\n1. Usa ngrok: npx ngrok http 3000\n2. Configura HTTPS en tu servidor\n3. Usa un túnel como Cloudflare Tunnel';
      }
      
      // Verificar MediaDevices
      if (!navigator.mediaDevices) {
        if (deviceInfo.isMobile) {
          return '❌ MÓVIL: navigator.mediaDevices no disponible.\n\n💡 Posibles causas:\n1. Navegador muy antiguo\n2. Modo incógnito/privado\n3. Configuración de privacidad muy restrictiva';
        }
        return '❌ navigator.mediaDevices no disponible';
      }
      
      // Verificar getUserMedia
      if (!navigator.mediaDevices.getUserMedia) {
        return '❌ navigator.mediaDevices.getUserMedia no disponible';
      }
      
      console.log('✅ APIs disponibles, intentando acceder a la cámara...');
      
      // Intentar obtener acceso a la cámara con configuración mínima
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true 
      });
      
      console.log('✅ Stream obtenido exitosamente');
      
      // Detener el stream inmediatamente
      stream.getTracks().forEach(track => track.stop());
      
      return '✅ Cámara funciona correctamente';
      
    } catch (error) {
      console.error('❌ Error en prueba de cámara:', error);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          if (deviceInfo.isMobile) {
            return '❌ MÓVIL: Permisos denegados.\n\n💡 SOLUCIONES:\n1. Toca el ícono de candado en la barra de direcciones\n2. Permite acceso a cámara\n3. Recarga la página\n4. En Chrome móvil: Configuración > Permisos del sitio > Cámara';
          }
          return '❌ Permisos de cámara denegados. Permite el acceso a la cámara.';
        } else if (error.name === 'NotFoundError') {
          return '❌ No se encontró ninguna cámara en el dispositivo.';
        } else if (error.name === 'NotSupportedError') {
          if (deviceInfo.isMobile) {
            return '❌ MÓVIL: Navegador no soporta cámara.\n\n💡 SOLUCIONES:\n1. Actualiza tu navegador\n2. Usa Chrome o Safari\n3. Verifica que no estés en modo incógnito';
          }
          return '❌ El navegador no soporta acceso a cámara.';
        } else if (error.name === 'NotReadableError') {
          if (deviceInfo.isMobile) {
            return '❌ MÓVIL: Cámara ocupada.\n\n💡 SOLUCIONES:\n1. Cierra otras apps que usen cámara\n2. Cierra otras pestañas del navegador\n3. Reinicia el navegador';
          }
          return '❌ La cámara está siendo usada por otra aplicación.';
        } else {
          return `❌ Error: ${error.message}\n\n📱 Dispositivo: ${deviceInfo.isMobile ? 'Móvil' : 'Desktop'}\n🔒 HTTPS: ${deviceInfo.isHTTPS ? 'Sí' : 'No'}`;
        }
      }
      
      return '❌ Error desconocido al acceder a la cámara';
    }
  }

  // Obtener configuraciones de cámara según el dispositivo
  private getConstraints(): MediaStreamConstraints {
    const deviceInfo = this.getDeviceInfo();

    if (deviceInfo.isAndroid) {
      // Configuración específica para Android - más conservadora
      return {
        video: {
          facingMode: "environment", // Forzar cámara trasera en Android
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          frameRate: { min: 15, ideal: 24, max: 30 } // Frame rate más bajo para Android
        },
        audio: false
      };
    } else if (deviceInfo.isMobile) {
      // Configuración para otros móviles (iOS, etc.)
      return {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 }
        },
        audio: false
      };
    } else {
      // Configuración para escritorio
      return {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60 }
        },
        audio: false
      };
    }
  }

  // Configurar elemento de video para móviles
  private configurarVideoParaMoviles(video: HTMLVideoElement): void {
    const deviceInfo = this.getDeviceInfo();
    
    if (deviceInfo.isMobile) {
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      video.muted = true;
      video.autoplay = true;
    }
  }

  // Obtener stream de cámara (versión simplificada y optimizada)
  private async obtenerStreamCamara(): Promise<MediaStream> {
    console.log('📷 BarcodeScanner: Obteniendo stream de cámara...');

    // Intentar con configuración básica primero
    const basicConstraints: MediaStreamConstraints = {
      video: { facingMode: "environment" },
      audio: false
    };

    try {
      console.log('📱 Intentando configuración básica...');
      return await navigator.mediaDevices.getUserMedia(basicConstraints);
    } catch (error) {
      console.warn("❌ Configuración básica falló, intentando cualquier cámara:", error);
      
      // Fallback: cualquier cámara disponible
      const fallbackConstraints: MediaStreamConstraints = {
        video: true,
        audio: false
      };
      
      console.log('📱 Intentando cualquier cámara...');
      return await navigator.mediaDevices.getUserMedia(fallbackConstraints);
    }
  }

  // Obtener mensaje de error específico
  private obtenerMensajeError(error: unknown): string {
    if (error && typeof error === 'object' && 'name' in error) {
      const errorName = (error as { name: string }).name;
      
      switch (errorName) {
        case 'NotAllowedError':
          return "Permisos de cámara denegados. Por favor, permite el acceso a la cámara en la configuración del navegador.";
        case 'NotFoundError':
          return "No se encontró ninguna cámara en tu dispositivo.";
        case 'NotSupportedError':
          return "Tu navegador no soporta acceso a la cámara.";
        case 'NotReadableError':
          return "La cámara está siendo usada por otra aplicación. Cierra otras apps que usen la cámara.";
        case 'OverconstrainedError':
          return "Las configuraciones de cámara no son compatibles con tu dispositivo.";
        default:
          return "No se pudo acceder a la cámara.";
      }
    }
    return "Error desconocido al acceder a la cámara.";
  }

  // Iniciar escáner (versión optimizada)
  public async iniciarEscaner(videoElement: HTMLVideoElement): Promise<void> {
    try {
      console.log('🚀 BarcodeScanner: Iniciando escáner...');
      this.videoRef = videoElement;
      this.escaneando = true;
      this.config.onStatusChange(true);

      // Verificar soporte de cámara
      if (!this.verificarSoporteCamara()) {
        const errorMessage = "No se puede acceder a la cámara. Verifica que tu navegador soporte cámara y que tengas permisos habilitados.";
        console.error('❌ Error de soporte de cámara:', errorMessage);
        this.config.onError(errorMessage);
        throw new Error(errorMessage);
      }

      const deviceInfo = this.getDeviceInfo();
      console.log('📱 BarcodeScanner: Información del dispositivo:', deviceInfo);

      // Verificar HTTPS en dispositivos móviles
      if (deviceInfo.isMobile && !deviceInfo.isHTTPS && !deviceInfo.isLocalhost) {
        throw new Error("Se requiere HTTPS para acceder a la cámara en dispositivos móviles. Accede desde una conexión segura.");
      }

      // Obtener stream de cámara
      console.log('📹 BarcodeScanner: Obteniendo stream de cámara...');
      const stream = await this.obtenerStreamCamara();
      this.streamActivo = stream;
      console.log('✅ BarcodeScanner: Stream obtenido exitosamente');

      // Configurar elemento de video
      this.videoRef.srcObject = stream;
      this.configurarVideoParaMoviles(this.videoRef);

      // Crear una promesa para esperar que el video esté listo
      await new Promise<void>((resolve, reject) => {
        if (!this.videoRef) {
          reject(new Error('Video element no disponible'));
          return;
        }

        const timeoutId = setTimeout(() => {
          reject(new Error('Timeout esperando que el video esté listo'));
        }, 10000); // 10 segundos de timeout

        this.videoRef.onloadedmetadata = () => {
          clearTimeout(timeoutId);
          console.log('📺 BarcodeScanner: Video metadata cargado');
          
          if (this.videoRef) {
            this.videoRef.play()
              .then(() => {
                console.log('▶️ BarcodeScanner: Video reproduciendo');
                resolve();
              })
              .catch(playError => {
                console.error("❌ BarcodeScanner: Error reproduciendo video:", playError);
                reject(new Error("Error reproduciendo la cámara. Intenta nuevamente."));
              });
          }
        };

        this.videoRef.onerror = (error) => {
          clearTimeout(timeoutId);
          console.error("❌ BarcodeScanner: Error en elemento de video:", error);
          reject(new Error("Error cargando el video de la cámara"));
        };
      });

      // Iniciar detección de códigos de barras
      console.log('🔍 BarcodeScanner: Iniciando detección de códigos...');
      setTimeout(() => {
        this.iniciarDeteccionCodigo();
      }, 1000);

      console.log('✅ BarcodeScanner: Escáner iniciado completamente');

    } catch (error) {
      console.error("❌ BarcodeScanner: Error iniciando escáner:", error);
      
      let errorMessage = this.obtenerMensajeError(error);
      
      // Si el error ya contiene una solución (como los errores de soporte de cámara), usarlo directamente
      if (error instanceof Error && error.message.includes('💡')) {
        errorMessage = error.message;
      } else {
        // Agregar contexto adicional para otros errores
        const deviceInfo = this.getDeviceInfo();
        if (!deviceInfo.isHTTPS && !deviceInfo.isLocalhost) {
          errorMessage += "\n\n💡 SUGERENCIA: Intenta acceder desde HTTPS o localhost para mejor compatibilidad con la cámara.";
        }
      }
      
      this.config.onError(errorMessage);
      this.detenerEscaner();
    }
  }

  // Iniciar detección de código
  private iniciarDeteccionCodigo(): void {
    if (!this.videoRef) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    const detectarCodigo = () => {
      if (!this.escaneando || !this.videoRef || !context) return;

      canvas.width = this.videoRef.videoWidth;
      canvas.height = this.videoRef.videoHeight;
      context.drawImage(this.videoRef, 0, 0, canvas.width, canvas.height);
      
      // Obtener datos de imagen
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Detección simple basada en patrones
      this.detectarCodigoSimple(imageData);
      
      // Continuar detección
      if (this.escaneando) {
        this.detectionInterval = window.setTimeout(detectarCodigo, 100);
      }
    };

    detectarCodigo();
  }

  // Detección simple de código de barras
  private detectarCodigoSimple(imageData: ImageData): void {
    // Esta es una implementación básica
    // En una implementación real, usarías una librería como ZXing o QuaggaJS
    
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Buscar patrones de líneas verticales (simulación básica)
    let lineCount = 0;
    const threshold = 50;
    
    for (let y = Math.floor(height / 2); y < Math.floor(height / 2) + 10; y++) {
      let lastPixelDark = false;
      
      for (let x = 0; x < width; x++) {
        const pixelIndex = (y * width + x) * 4;
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        
        // Convertir a escala de grises
        const gray = (r + g + b) / 3;
        const isDark = gray < threshold;
        
        if (isDark !== lastPixelDark) {
          lineCount++;
          lastPixelDark = isDark;
        }
      }
    }
    
    // Si detectamos muchas transiciones, podría ser un código de barras
    if (lineCount > 20) {
      // Generar un código simulado (en implementación real, decodificarías el patrón)
      const codigoSimulado = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
      console.log('📊 Código detectado (simulado):', codigoSimulado);
      this.config.onScanSuccess(codigoSimulado);
      // NO detener el escáner automáticamente - mantener cámara activa
      // this.detenerEscaner();
    }
  }

  // Generar código simulado para pruebas
  private generarCodigoSimulado(): string {
    const prefijos = ['123', '456', '789', '012'];
    const prefijo = prefijos[Math.floor(Math.random() * prefijos.length)];
    const numero = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return prefijo + numero;
  }

  // Detener escáner
  public detenerEscaner(): void {
    console.log('🛑 BarcodeScanner: Deteniendo escáner...');
    
    this.escaneando = false;
    this.config.onStatusChange(false);
    
    // Limpiar interval de detección
    if (this.detectionInterval) {
      clearTimeout(this.detectionInterval);
      this.detectionInterval = null;
    }
    
    // Detener stream de cámara
    if (this.streamActivo) {
      this.streamActivo.getTracks().forEach(track => {
        console.log(`🔄 Deteniendo track: ${track.kind}`);
        track.stop();
      });
      this.streamActivo = null;
    }
    
    // Limpiar elemento de video
    if (this.videoRef) {
      this.videoRef.srcObject = null;
      this.videoRef = null;
    }
    
    console.log('✅ BarcodeScanner: Escáner detenido completamente');
  }

  // Verificar si está escaneando
  public estaEscaneando(): boolean {
    return this.escaneando;
  }
}