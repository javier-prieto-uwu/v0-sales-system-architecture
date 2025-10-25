import { useRef, useState, useCallback } from 'react';
import { BarcodeScanner, type ScannerConfig, type DeviceInfo } from './barcode-scanner';

export interface UseBarcodeScanner {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isScanning: boolean;
  error: string;
  deviceInfo: DeviceInfo;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
  clearError: () => void;
}

export function useBarcodeScanner(onScanSuccess: (codigo: string) => void): UseBarcodeScanner {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<BarcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isAndroid: false,
    isMobile: false,
    isHTTPS: false,
    isLocalhost: false
  });

  const clearError = useCallback(() => {
    setError('');
  }, []);

  const startScanning = useCallback(async () => {
    console.log('🎯 Iniciando función startScanning...');
    
    // Activar el estado de scanning primero para que se renderice el video
    setIsScanning(true);
    setError('');
    
    // Esperar un momento para que el DOM se actualice
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!videoRef.current) {
      console.error('❌ Elemento de video no disponible');
      setError('Elemento de video no disponible. Intenta de nuevo.');
      setIsScanning(false);
      return;
    }

    console.log('✅ Elemento de video disponible');

    try {
      clearError();
      console.log('🔄 Iniciando configuración del escáner...');
      
      const config: ScannerConfig = {
        onScanSuccess: (codigo: string) => {
          console.log('✅ Código escaneado:', codigo);
          onScanSuccess(codigo);
          // NO detener el escáner - mantener la cámara activa
          // setIsScanning(false); // Comentado para mantener cámara activa
        },
        onError: (errorMessage: string) => {
          console.error('❌ Error en escáner:', errorMessage);
          setError(errorMessage);
          setIsScanning(false);
        },
        onStatusChange: (scanning: boolean) => {
          console.log('📊 Estado del escáner cambiado:', scanning);
          setIsScanning(scanning);
        }
      };

      const scanner = new BarcodeScanner(config);
      scannerRef.current = scanner;
      
      // Obtener información del dispositivo
      const deviceInfo = scanner.getDeviceInfo();
      console.log('📱 Información del dispositivo:', deviceInfo);
      setDeviceInfo(deviceInfo);
      
      console.log('🚀 Iniciando escáner...');
      await scanner.iniciarEscaner(videoRef.current);
      
      // Mover el video al contenedor visible
      const videoContainer = document.getElementById('video-container');
      if (videoContainer && videoRef.current) {
        console.log('📺 Moviendo video al contenedor visible...');
        videoRef.current.className = 'w-full h-full object-cover';
        videoContainer.appendChild(videoRef.current);
      }
      
      console.log('✅ Escáner iniciado exitosamente');
    } catch (err) {
      console.error('❌ Error al inicializar el escáner:', err);
      setError('Error al inicializar el escáner');
      setIsScanning(false);
    }
  }, [onScanSuccess, clearError]);

  const stopScanning = useCallback(() => {
    console.log('🛑 stopScanning llamado');
    
    if (scannerRef.current) {
      console.log('🔄 Deteniendo escáner...');
      scannerRef.current.detenerEscaner();
      scannerRef.current = null;
      console.log('✅ Escáner detenido');
    } else {
      console.log('⚠️ No hay escáner activo para detener');
    }
    
    // Devolver el video a su posición oculta
    if (videoRef.current) {
      console.log('📺 Devolviendo video a posición oculta...');
      videoRef.current.className = 'hidden';
      // Buscar el contenedor original (el primer video en el DOM)
      const hiddenVideoContainer = document.querySelector('video.hidden')?.parentElement;
      if (hiddenVideoContainer) {
        hiddenVideoContainer.appendChild(videoRef.current);
      }
    }
    
    setIsScanning(false);
  }, []);

  return {
    videoRef,
    isScanning,
    error,
    deviceInfo,
    startScanning,
    stopScanning,
    clearError
  };
}