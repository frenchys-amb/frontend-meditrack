import React from "react";

interface QRProps {
  value: string;
  size?: number;
}

/**
 * QRCodeSVG - versión ligera sin librerías
 * NO es un QR real, pero sirve como código visual identificador.
 * Si quieres un QR real, puedo darte una versión con "qrcode" o "qrcode.react".
 */
export default function QRCodeSVG({ value, size = 200 }: QRProps) {
  const qrSize = 25; // tamaño de la cuadrícula
  const cellSize = size / qrSize;

  const pattern: { x: number; y: number }[] = [];

  for (let y = 0; y < qrSize; y++) {
    for (let x = 0; x < qrSize; x++) {
      const hash =
        (value.charCodeAt(x % value.length) + x + y * qrSize) % 2;

      // Cuadrantes tipo QR (decorativo)
      const isStaticCorner =
        (x < 7 && y < 7) ||
        (x > qrSize - 8 && y < 7) ||
        (x < 7 && y > qrSize - 8);

      if (hash === 0 || isStaticCorner) {
        pattern.push({ x, y });
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label="QR"
      style={{ background: "#fff" }}
    >
      {/* Fondo blanco */}
      <rect width={size} height={size} fill="#ffffff" />

      {/* Celdas negras */}
      {pattern.map((cell, i) => (
        <rect
          key={i}
          x={cell.x * cellSize}
          y={cell.y * cellSize}
          width={cellSize}
          height={cellSize}
          fill="#000000"
        />
      ))}
    </svg>
  );
}
