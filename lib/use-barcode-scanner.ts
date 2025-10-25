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
    
    // Verificar que el elemento de video esté disponible
    if (!videoRef.current) {
      console.error('❌ Elemento de video no disponible');
      setError('Elemento de video no disponible. Intenta de nuevo.');
      return;
    }

    console.log('✅ Elemento de video disponible');

    try {
      console.log('🔄 Iniciando configuración del escáner...');
      
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
      const errorMessage = err instanceof Error ? err.message : 'Error al inicializar el escáner';
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