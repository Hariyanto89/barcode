document.getElementById("generateBtn").addEventListener("click", generateQRAndBarcode);

function generateQRAndBarcode() {
  const link = document.getElementById("linkInput").value.trim();
  if (!link) {
    alert("Masukkan link terlebih dahulu!");
    return;
  }

  // Buat QR Code di canvas
  const qrCanvas = document.getElementById("qrCanvas");
  QRCode.toCanvas(qrCanvas, link, { width: 200 }, function (error) {
    if (error) {
      console.error(error);
      alert("Gagal membuat QR Code");
    } else {
      console.log("QR Code berhasil dibuat");
    }
  });

  // Buat Barcode Gunung
  generateMountainBarcode(link);
}

function generateMountainBarcode(data) {
  const tempCanvas = document.createElement("canvas");
  JsBarcode(tempCanvas, data, {
    format: "CODE128",
    displayValue: false,
    background: "#ffffff",
    lineColor: "#0000ff", // biru
    width: 2,
    height: 80
  });

  const ctx = document.getElementById("barcodeCanvas").getContext("2d");
  const imgData = tempCanvas.getContext("2d").getImageData(0, 0, tempCanvas.width, tempCanvas.height);

  ctx.clearRect(0, 0, 500, 200);

  const peak1 = 20;
  const peak2 = 35;
  const peak3 = 25;

  for (let x = 0; x < imgData.width; x++) {
    let isBar = false;
    for (let y = 0; y < imgData.height; y++) {
      const idx = (y * imgData.width + x) * 4;
      if (imgData.data[idx] === 0) {
        isBar = true;
        break;
      }
    }

    if (isBar) {
      let mountainExtra =
        peak1 * Math.sin((x / imgData.width) * Math.PI) +
        peak2 * Math.sin((x / imgData.width) * Math.PI * 2) +
        peak3 * Math.sin((x / imgData.width) * Math.PI * 3);

      ctx.fillStyle = "#0000ff"; // biru
      ctx.fillRect(x, 200 - (80 + mountainExtra), 1, 80 + mountainExtra);
    }
  }
}
