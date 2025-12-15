import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

interface Props {
  value: string;   // URL del login
  size?: number;
  filename?: string;
  className?: string;
}

export default function QRWithDownload({ value, size = 220, filename = "qr-login.svg", className = "" }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const downloadQR = () => {
    if (!svgRef.current) return;

    const svgString = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex flex-col items-center space-y-4 bg-white p-6 rounded-2xl shadow-xl border border-gray-200 ${className}`}>
      <QRCodeSVG
        ref={svgRef}
        value={value}
        size={size}
        level="H"
        includeMargin={true}
      />

      <button
        onClick={downloadQR}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm shadow-md transition"
      >
        Descargar QR
      </button>
    </div>
  );
}
