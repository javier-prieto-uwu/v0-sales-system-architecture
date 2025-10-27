import Quagga from 'quagga';

export class BarcodeScanner {
  private video: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private isScanning: boolean = false;
  private onScanSuccess: (code: string) => void;
  private lastDetectedCode: string = '';
  private lastDetectionTime: number = 0;
  private readonly DETECTION_COOLDOWN = 2000; // 2 segundos entre detecciones del mismo código

  constructor(onScanSuccess: (code: string) => void) {
    this.onScanSuccess = onScanSuccess;
  }

  async iniciar(videoElement: HTMLVideoElement): Promise<void> {
    try {
      this.video = videoElement;
      
      // Detectar si es un dispositivo móvil
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      console.log(`📱 Dispositivo móvil detectado: ${isMobile}`);

      // Configuración específica para móviles
      const videoConstraints = isMobile ? {
        video: {
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          facingMode: { exact: 'environment' }, // Forzar cámara trasera en móviles
          focusMode: 'continuous',
          exposureMode: 'continuous',
          whiteBalanceMode: 'continuous'
        }
      } : {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        }
      };

      // Primero obtener acceso a la cámara
      console.log('🎥 Solicitando acceso a la cámara...');
      
      try {
        this.stream = await navigator.mediaDevices.getUserMedia(videoConstraints);
      } catch (error) {
        // Si falla con cámara trasera específica, intentar con cualquier cámara
        console.log('⚠️ Fallback: intentando con cualquier cámara disponible');
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { min: 640, ideal: 1280 },
            height: { min: 480, ideal: 720 },
            facingMode: 'environment'
          }
        });
      }

      // Asignar el stream al elemento de video
      this.video.srcObject = this.stream;
      this.video.setAttribute('playsinline', 'true');
      this.video.setAttribute('autoplay', 'true');
      this.video.setAttribute('muted', 'true');
      
      // Configurar atributos específicos para móviles
      if (isMobile) {
        this.video.setAttribute('webkit-playsinline', 'true');
      }
      
      // Esperar a que el video esté listo
      await new Promise<void>((resolve, reject) => {
        this.video!.onloadedmetadata = () => {
          console.log('✅ Video metadata cargada');
          this.video!.play().then(() => {
            console.log('✅ Video reproduciendo');
            resolve();
          }).catch(reject);
        };
        this.video!.onerror = reject;
      });

      console.log('✅ Stream de video configurado correctamente');
      
      // Esperar un momento para que el video se estabilice
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Configurar QuaggaJS con configuración optimizada para móviles
      const config = {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: this.video,
          constraints: {
            width: isMobile ? 1280 : 1280,
            height: isMobile ? 720 : 720,
            facingMode: 'environment'
          }
        },
        locator: {
          patchSize: isMobile ? "large" : "medium", // Parches más grandes en móviles
          halfSample: isMobile ? false : true // Mejor calidad en móviles
        },
        numOfWorkers: isMobile ? 1 : 2, // Menos workers en móviles
        frequency: isMobile ? 5 : 10, // Menor frecuencia en móviles para mejor rendimiento
        decoder: {
          readers: isMobile ? [
            // Reducir lectores en móviles para mejor rendimiento
            "code_128_reader",
            "ean_reader",
            "ean_8_reader",
            "code_39_reader",
            "upc_reader"
          ] : [
            "code_128_reader",
            "ean_reader",
            "ean_8_reader",
            "code_39_reader",
            "code_39_vin_reader",
            "codabar_reader",
            "upc_reader",
            "upc_e_reader",
            "i2of5_reader"
          ]
        },
        locate: true,
        debug: {
          showCanvas: false,
          showPatches: false,
          showFoundPatches: false,
          showSkeleton: false,
          showLabels: false,
          showPatchLabels: false,
          showRemainingPatchLabels: false,
          boxFromPatches: {
            showTransformed: false,
            showTransformedBox: false,
            showBB: false
          }
        }
      };

      // Inicializar QuaggaJS
      await new Promise<void>((resolve, reject) => {
        Quagga.init(config, (err) => {
          if (err) {
            console.error('❌ Error inicializando QuaggaJS:', err);
            reject(err);
            return;
          }
          console.log('✅ QuaggaJS inicializado correctamente');
          resolve();
        });
      });

      // Configurar el callback de detección
      Quagga.onDetected(this.handleDetection.bind(this));

      // Iniciar el escáner
      Quagga.start();
      this.isScanning = true;

      console.log('✅ Escáner de códigos de barras iniciado con QuaggaJS');
    } catch (error) {
      console.error('❌ Error al iniciar el escáner:', error);
      
      // Limpiar recursos en caso de error
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }
      
      throw error;
    }
  }

  private handleDetection(result: any): void {
    if (!result?.codeResult?.code) return;

    const code = result.codeResult.code;
    const format = result.codeResult.format;
    const currentTime = Date.now();

    // Evitar detecciones duplicadas
    if (code === this.lastDetectedCode && 
        currentTime - this.lastDetectionTime < this.DETECTION_COOLDOWN) {
      return;
    }

    this.lastDetectedCode = code;
    this.lastDetectionTime = currentTime;

    console.log(`Código detectado: ${code} (Formato: ${format})`);
    this.onScanSuccess(code);
  }

  detener(): void {
    try {
      if (this.isScanning) {
        Quagga.stop();
        this.isScanning = false;
        console.log('Escáner detenido');
      }

      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }

      this.video = null;
    } catch (error) {
      console.error('Error al detener el escáner:', error);
    }
  }

  estaEscaneando(): boolean {
    return this.isScanning;
  }
}