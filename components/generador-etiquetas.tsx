"use client";

import { useState } from "react";
import type React from "react";
import JsBarcode from "jsbarcode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface RowData {
  pieza: string;
  descripcion: string;
  cantidad: number;
}

export function GeneradorEtiquetas() {
  const [rows, setRows] = useState([
    { pieza: "", descripcion: "", cantidad: 1 },
  ]);
  const [labelWidth, setLabelWidth] = useState(60);

  const addRow = () => {
    setRows([...rows, { pieza: "", descripcion: "", cantidad: 1 }]);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    const lines = text.trim().split(/\r?\n/);
    const newRows = lines.map((line: string) => {
      const [pieza, descripcion, cantidad] = line.split(/\t/);
      return {
        pieza: pieza?.trim() || "",
        descripcion: descripcion?.trim() || "",
        cantidad: Number(cantidad?.trim()) || 1,
      };
    });
    setRows(newRows);
  };

  const updateRow = (index: number, field: keyof RowData, value: string | number) => {
    const newRows = [...rows];
    newRows[index][field] = value as never;
    setRows(newRows);
  };

  const renderBarcode = (element: HTMLElement | null, value: string) => {
    if (!element) return;
    try {
      JsBarcode(element, value, {
        format: "CODE128",
        displayValue: false,
        height: 20,
        width: 1.2,
        margin: 0,
      });
    } catch {
      element.innerHTML = "<span>Error</span>";
    }
  };

  const generatePDF = async () => {
    const pages = document.querySelectorAll(".page");
    const pdf = new jsPDF("p", "mm", "a4");

    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i] as HTMLElement, { scale: 3 });
      const imgData = canvas.toDataURL("image/png");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, Math.min(imgHeight, pageHeight));
    }

    pdf.save("etiquetas.pdf");
  };

  const labelHeight = 42;
  const gap = 4;
  const pageWidth = 210 - 20;
  const pageHeight = 297 - 20;
  const colsPerPage = Math.floor((pageWidth + gap) / (labelWidth + gap));
  const rowsPerPage = Math.floor((pageHeight + gap) / (labelHeight + gap));
  const labelsPerPage = colsPerPage * rowsPerPage;

  const allLabels = rows.flatMap((row) =>
    Array.from({ length: row.cantidad }, () => row)
  );

  return (
    <div className="etiquetas-container">
      <div className="etiquetas-editor">
        <h1 className="etiquetas-title">Editor de Etiquetas</h1>

        <table className="etiquetas-table">
          <thead>
            <tr>
              <th>PIEZA</th>
              <th>DESCRIPCION1</th>
              <th>CANTIDAD</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td>
                  <input
                    className="etiquetas-input"
                    value={row.pieza}
                    onChange={(e) => updateRow(i, "pieza", e.target.value)}
                    onPaste={handlePaste}
                  />
                </td>
                <td>
                  <input
                    className="etiquetas-input"
                    value={row.descripcion}
                    onChange={(e) => updateRow(i, "descripcion", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="etiquetas-input"
                    value={row.cantidad}
                    onChange={(e) => updateRow(i, "cantidad", Number(e.target.value))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={addRow}
          className="btn-primary"
        >
          + Agregar fila
        </button>

        <div className="width-control">
          <label>Ajustar Ancho: {labelWidth}mm</label>
          <input
            type="range"
            className="width-slider"
            min="40"
            max="95"
            value={labelWidth}
            onChange={(e) => setLabelWidth(Number(e.target.value))}
          />
        </div>

        <button
          onClick={generatePDF}
          className="btn-success"
        >
          Exportar PDF
        </button>
      </div>

      <div id="print-sheet-container" className="print-container">
        {Array.from(
          { length: Math.ceil(allLabels.length / labelsPerPage) },
          (_, pageIndex) => (
            <div
              key={pageIndex}
              className="page"
            >
              {allLabels
                .slice(
                  pageIndex * labelsPerPage,
                  pageIndex * labelsPerPage + labelsPerPage
                )
                .map((data, i) => {
                  const lastFour = data.pieza.slice(-4);
                  const combinedLen = data.descripcion.length + data.pieza.length;
                  const descScale =
                    combinedLen > 85 ? 0.85 : combinedLen > 60 ? 1.0 : 1.1;
                  const baseSize = labelWidth / 5;
                  const id = `barcode-${pageIndex}-${i}`;

                  setTimeout(() => {
                    renderBarcode(document.getElementById(id), data.pieza);
                  }, 100);

                  return (
                    <div
                      key={i}
                      className="label"
                      style={{
                        width: `${labelWidth}mm`,
                        height: `42mm`,
                      }}
                    >
                      <div className="label-description">
                        <span
                          style={{ fontSize: baseSize * descScale }}
                        >
                          {data.descripcion}
                        </span>
                        <span
                          className="part-number"
                          style={{ fontSize: baseSize * descScale }}
                        >
                          {data.pieza}
                        </span>
                      </div>
                      <div className="label-last-four">
                        <span
                          style={{ fontSize: baseSize * 2.8, lineHeight: 1 }}
                        >
                          {lastFour}
                        </span>
                      </div>
                      <div className="label-barcode">
                        <svg id={id}></svg>
                      </div>
                    </div>
                  );
                })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
