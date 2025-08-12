document.getElementById("generateBtn").addEventListener("click", shortenAndGenerate);

function shortenAndGenerate() {
  const longUrl = document.getElementById("linkInput").value.trim();
  if (!longUrl) {
    alert("Masukkan link terlebih dahulu!");
    return;
  }

  // API shortener (is.gd)
  fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(longUrl)}`)
    .then(res => res.text())
    .then(shortUrl => {
      document.getElementById("shortLink").style.display = "block";
      const linkEl = document.querySelector("#shortLink a");
      linkEl.textContent = shortUrl;
      linkEl.href = shortUrl;

      generateMountainBarcode(shortUrl);
    })
    .catch(err => {
      alert("Gagal memendekkan link: " + err);
    });
}

function generateMountainBarcode(data) {
  // Buat barcode normal di canvas sementara
  const tempCanvas = document.createElement("canvas");
  JsBarcode(tempCanvas, data, {
    format: "CODE128",
    displayValue: false,
    background: "#ffffff",
    lineColor: "#000000",
    width: 2,
    height: 100
  });

  const ctx = document.getElementById("barcodeCanvas").getContext("2d");
  const imgData = tempCanvas.getContext("2d").getImageData(0, 0, tempCanvas.width, tempCanvas.height);

  ctx.clearRect(0, 0, 500, 200);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 500, 200);

  // Tiga puncak gunung
  const peak1 = Math.random() * 20 + 20; // tinggi tambahan puncak 1
  const peak2 = Math.random() * 20 + 40; // tinggi tambahan puncak 2
  const peak3 = Math.random() * 20 + 30; // tinggi tambahan puncak 3

  for (let x = 0; x < imgData.width; x++) {
    const isBar = imgData.data[x * 4] === 0 && imgData.data[x * 4 + 1] === 0 && imgData.data[x * 4 + 2] === 0;
    if (isBar) {
      // Bentuk tiga puncak dengan ujung runcing
      let height = 100
                 + peak1 * Math.sin((x / imgData.width) * Math.PI) // puncak 1
                 + peak2 * Math.sin((x / imgData.width) * Math.PI * 2) // puncak 2
                 + peak3 * Math.sin((x / imgData.width) * Math.PI * 3); // puncak 3

      // Runcing → tambahkan variasi segitiga
      height += Math.abs(Math.sin(x / 3)) * 5;

      ctx.fillStyle = "#000000";
      ctx.fillRect(x, 200 - height, 1, height);
    }
  }
}
