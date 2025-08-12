document.getElementById("generateBtn").addEventListener("click", shortenAndGenerate);

function shortenAndGenerate() {
  const longUrl = document.getElementById("linkInput").value.trim();
  if (!longUrl) {
    alert("Masukkan link terlebih dahulu!");
    return;
  }

  fetch(`https://api.shrtco.de/v2/shorten?url=${encodeURIComponent(longUrl)}`)
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        const shortUrl = data.result.full_short_link;
        showShortLink(shortUrl);
        generateMountainBarcode(shortUrl);
      } else {
        alert("Gagal memendekkan link: " + data.error);
      }
    })
    .catch(err => {
      alert("Error koneksi: " + err);
    });
}

function showShortLink(shortUrl) {
  document.getElementById("shortLink").style.display = "block";
  const linkEl = document.querySelector("#shortLink a");
  linkEl.textContent = shortUrl;
  linkEl.href = shortUrl;
}

function generateMountainBarcode(data) {
  const tempCanvas = document.createElement("canvas");
  JsBarcode(tempCanvas, data, {
    format: "CODE128",
    displayValue: false,
    background: "#ffffff",
    lineColor: "#000000",
    width: 2,
    height: 80
  });

  const ctx = document.getElementById("barcodeCanvas").getContext("2d");
  const imgData = tempCanvas.getContext("2d").getImageData(0, 0, tempCanvas.width, tempCanvas.height);

  ctx.clearRect(0, 0, 500, 200);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 500, 200);

  // Buat tiga puncak di atas barcode
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

      ctx.fillStyle = "#000000";
      ctx.fillRect(x, 200 - (80 + mountainExtra), 1, 80 + mountainExtra);
    }
  }
}
