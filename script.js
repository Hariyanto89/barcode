document.getElementById("generateBtn").addEventListener("click", generateBarcode);

function generateBarcode() {
  const text = document.getElementById("barcodeData").value;

  // Buat barcode di canvas sementara
  const tempCanvas = document.createElement("canvas");
  JsBarcode(tempCanvas, text, {
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

  // gambar garis sesuai pola gunung (hitam di atas putih)
  for (let x = 0; x < imgData.width; x++) {
    const isBar = imgData.data[x * 4] === 0 && imgData.data[x * 4 + 1] === 0 && imgData.data[x * 4 + 2] === 0;
    if (isBar) {
      // bikin siluet gunung dengan beberapa puncak
      let height = 100 
                 + 20 * Math.sin((x / imgData.width) * Math.PI * 2) // gunung 1
                 + 15 * Math.sin((x / imgData.width) * Math.PI * 4); // gunung 2
      ctx.fillStyle = "#000000";
      ctx.fillRect(x, 200 - height, 1, height);
    }
  }
}
