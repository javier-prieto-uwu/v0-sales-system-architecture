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
      
      // Configurar QuaggaJS
      const config = {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: this.video,
          constraints: {
            width: 640,
            height: 480,
            facingMode: "environment" // Cámara trasera
          }
        },
        locator: {
          patchSize: "medium",
          halfSample: true
        },
        numOfWorkers: 2,
        frequency: 10,
        decoder: {
          readers: [
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
        locate: true
      };

      // Inicializar QuaggaJS
      await new Promise<void>((resolve, reject) => {
        Quagga.init(config, (err) => {
          if (err) {
            console.error('Error inicializando QuaggaJS:', err);
            reject(err);
            return;
          }
          resolve();
        });
      });

      // Configurar el callback de detección
      Quagga.onDetected(this.handleDetection.bind(this));

      // Iniciar el escáner
      Quagga.start();
      this.isScanning = true;

      console.log('Escáner de códigos de barras iniciado con QuaggaJS');
    } catch (error) {
      console.error('Error al iniciar el escáner:', error);
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