// Warna biru DIPAYANG untuk garis barcode
const BAR_COLOR = "#023e8a";

// Elemen DOM
const generateBtn = document.getElementById("generateBtn");
const linkInput = document.getElementById("linkInput");
const qrCanvas = document.getElementById("qrCanvas");
const barcodeCanvas = document.getElementById("barcodeCanvas");
const downloadQr = document.getElementById("downloadQr");
const downloadBarcode = document.getElementById("downloadBarcode");

// klik tombol
generateBtn.addEventListener("click", generateQRAndBarcode);

// MAIN FLOW
function generateQRAndBarcode() {
  const link = linkInput.value.trim();
  if (!link) {
    alert("Masukkan link terlebih dahulu!");
    return;
  }

  // 1) Generate QR code (untuk tampilan)
  QRCode.toCanvas(qrCanvas, link, { width: 200, margin: 2 }, function (err) {
    if (err) {
      console.error("QR gen error:", err);
      alert("Gagal membuat QR Code.");
    } else {
      // Tampilkan tombol download QR
      downloadQr.style.display = "inline-block";
      downloadQr.href = qrCanvas.toDataURL("image/png");
      downloadQr.download = "dipayang_qr.png";
    }
  });

  // 2) Generate barcode gunung dari data (tanpa shortener)
  generateMountainBarcode(link);
}

// UTILITY: buat barcode lalu render "gunung"
function generateMountainBarcode(data) {
  // buat temp canvas yang cukup besar supaya JsBarcode punya ruang
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = 1200; // lebarkan untuk menghindari clipping
  tempCanvas.height = 140;

  // Generate barcode di tempCanvas
  try {
    JsBarcode(tempCanvas, data, {
      format: "CODE128",
      displayValue: false,
      background: "#ffffff",
      lineColor: "#000000", // warna ini hanya untuk menghasilkan modul hitam/putih
      width: 2,
      height: 100,
      margin: 0
    });
  } catch (e) {
    console.error("JsBarcode error:", e);
    alert("Gagal membuat barcode (mungkin input terlalu panjang untuk barcode linear).");
    return;
  }

  // Ambil data pixel dari tempCanvas
  const tctx = tempCanvas.getContext("2d");
  const imgData = tctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

  // Siapkan target canvas (sengaja lebih lebar)
  const ctx = barcodeCanvas.getContext("2d");
  const OUT_W = barcodeCanvas.width;
  const OUT_H = barcodeCanvas.height;
  ctx.clearRect(0, 0, OUT_W, OUT_H);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, OUT_W, OUT_H);

  // Kita akan men-scale hasil barcode (temp -> output) supaya muat rapi.
  // Tentukan skala horizontal berdasarkan lebar modul yang terpakai di tempCanvas.
  // Cari minimal/maksimal x dimana ada bar
  let minX = tempCanvas.width, maxX = 0;
  for (let x = 0; x < imgData.width; x++) {
    for (let y = 0; y < imgData.height; y++) {
      const idx = (y * imgData.width + x) * 4;
      if (imgData.data[idx] < 128) { // hitam
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        break;
      }
    }
  }
  if (maxX <= minX) {
    alert("Gagal membaca modul barcode. Coba input lain.");
    return;
  }

  const usedWidth = maxX - minX + 1;
  const scale = Math.min(OUT_W / usedWidth, 3); // jangan terlalu besar
  const leftOffset = Math.floor((OUT_W - usedWidth * scale) / 2);

  // Parameter "gunung" (tiga puncak berbeda)
  const baseHeight = 80; // tinggi dasar yang tetap (bawah tetap lurus minimal)
  const peak1 = 24;
  const peak2 = 40;
  const peak3 = 28;

  // Gambar ulang kolom demi kolom, mempertahankan modul horizontal (agar scanner tetap baca)
  for (let sx = minX; sx <= maxX; sx++) {
    // Tentukan apakah kolom ini adalah "bar" (ada piksel hitam di kolom sx)
    let isBar = false;
    for (let y = 0; y < imgData.height; y++) {
      const idx = (y * imgData.width + sx) * 4;
      if (imgData.data[idx] < 128) {
        isBar = true;
        break;
      }
    }
    if (!isBar) continue;

    // Hitung posisi x pada canvas target
    const relX = sx - minX;
    const tx = Math.round(leftOffset + relX * scale);

    // bentuk gunung: gabungan 3 sinus untuk 3 puncak, ujung runcing karena sin
    const normalized = relX / usedWidth;
    const mountainExtra =
      peak1 * Math.sin(normalized * Math.PI) +
      peak2 * Math.sin(normalized * Math.PI * 2) +
      peak3 * Math.sin(normalized * Math.PI * 3);

    const colHeight = Math.round(baseHeight + mountainExtra);

    // gambar kolom dengan lebar = Math.ceil(scale) (agar tidak bolong)
    ctx.fillStyle = BAR_COLOR;
    const colW = Math.max(1, Math.round(scale));
    ctx.fillRect(tx, OUT_H - colHeight, colW, colHeight);
  }

  // Tampilkan tombol download
  downloadBarcode.style.display = "inline-block";
  downloadBarcode.href = barcodeCanvas.toDataURL("image/png");
  downloadBarcode.download = "dipayang_barcode_gunung.png";
}
