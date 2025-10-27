import { useRef, useState, useCallback } from 'react';
import { BarcodeScanner } from './barcode-scanner';

export interface UseBarcodeScanner {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isScanning: boolean;
  error: string;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
  clearError: () => void;
}

export function useBarcodeScanner(onScanSuccess: (codigo: string) => void): UseBarcodeScanner {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<BarcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');

  const clearError = useCallback(() => {
    setError('');
  }, []);

  const startScanning = useCallback(async () => {
    console.log('🎯 Iniciando función startScanning...');
    
    // Limpiar errores previos
    setError('');
    
    // Esperar a que el elemento de video esté disponible con reintentos
      let retries = 0;
      const maxRetries = 10;
      
      while (!videoRef.current && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }

      // Verificar que el elemento de video esté disponible
      if (!videoRef.current) {
        console.error('❌ Elemento de video no disponible después de reintentos');
        setError('Elemento de video no disponible. Intenta de nuevo.');
        setIsScanning(false);
        return;
      }

    console.log('✅ Elemento de video disponible');

    try {
      console.log('🔄 Iniciando configuración del escáner...');
      
      // Detectar dispositivo móvil
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      console.log(`📱 Dispositivo móvil: ${isMobile}`);
      
      // Configurar el video element para móviles antes de inicializar el escáner
      if (isMobile && videoRef.current) {
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        videoRef.current.muted = true;
        videoRef.current.autoplay = true;
      }
      
      // Crear el escáner con el callback de éxito
      const scanner = new BarcodeScanner((codigo: string) => {
        console.log('✅ Código escaneado:', codigo);
        onScanSuccess(codigo);
        // Mantener la cámara activa para múltiples escaneos
      });
      
      scannerRef.current = scanner;
      
      console.log('🚀 Iniciando escáner...');
      await scanner.iniciar(videoRef.current);
      
      setIsScanning(true);
      console.log('✅ Escáner iniciado exitosamente');
      
    } catch (err) {
      console.error('❌ Error al inicializar el escáner:', err);
      let errorMessage = 'Error al inicializar el escáner';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Acceso a la cámara denegado. Por favor, permite el acceso a la cámara y recarga la página.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No se encontró ninguna cámara en el dispositivo.';
        } else if (err.name === 'NotSupportedError') {
          errorMessage = 'La cámara no es compatible con este navegador.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'La cámara está siendo usada por otra aplicación.';
        } else if (err.name === 'OverconstrainedError') {
          errorMessage = 'Las configuraciones de cámara no son compatibles con este dispositivo. Intenta con otro navegador.';
        } else if (err.message.includes('facingMode')) {
          errorMessage = 'No se pudo acceder a la cámara trasera. Verifica que tu dispositivo tenga cámara trasera disponible.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      setIsScanning(false);
    }
  }, [onScanSuccess]);

  const stopScanning = useCallback(() => {
    console.log('🛑 stopScanning llamado');
    
    if (scannerRef.current) {
      console.log('🔄 Deteniendo escáner...');
      scannerRef.current.detener();
      scannerRef.current = null;
      console.log('✅ Escáner detenido');
    } else {
      console.log('⚠️ No hay escáner activo para detener');
    }
    
    setIsScanning(false);
  }, []);

  return {
    videoRef,
    isScanning,
    error,
    startScanning,
    stopScanning,
    clearError
  };
}