;(function () {

  "use strict";

  // -------- Utilidades UI --------
  function flash(message){
    const n = document.createElement("div");
    n.textContent = message;
    n.setAttribute("role", "status");
    n.style.position = "fixed";
    n.style.zIndex = "9999";
    n.style.left = "50%";
    n.style.top = "18px";
    n.style.transform = "translateX(-50%)";
    n.style.background = "linear-gradient(135deg,#8ab4ff,#b5ffd9)";
    n.style.color = "#0b1220";
    n.style.fontWeight = "800";
    n.style.padding = "10px 14px";
    n.style.borderRadius = "12px";
    n.style.boxShadow = "0 10px 30px rgba(0,0,0,.25)";
    document.body.appendChild(n);
    setTimeout(()=>{ n.style.opacity="0"; n.style.transition="opacity .35s ease"; }, 1400);
    setTimeout(()=>{ n.remove(); }, 1900);
  }

  // Copiar texto (IBAN)
  function copyText(selector){
    const el = document.querySelector(selector);
    if(!el) return;
    const txt = el.innerText || el.textContent || "";
    if(!txt) return;
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(()=> flash("IBAN copiado")).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
    function fallbackCopy(){
      const ta = document.createElement("textarea");
      ta.value = txt; ta.setAttribute("readonly", "");
      ta.style.position = "absolute"; ta.style.left = "-9999px";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); flash("IBAN copiado"); } catch(e){}
      document.body.removeChild(ta);
    }
  }

  // Smooth scroll interno
  document.addEventListener("click", function(ev){
    const a = ev.target.closest('a[href^="#"]');
    if(!a) return;
    const id = a.getAttribute("href");
    if(id.length < 2) return;
    const el = document.querySelector(id);
    if(!el) return;
    ev.preventDefault();
    el.scrollIntoView({behavior:"smooth", block:"start"});
  });

  // Delegación: copiar IBAN
  document.addEventListener("click", function(ev){
    const btn = ev.target.closest("[data-copy]");
    if(!btn) return;
    const selector = btn.getAttribute("data-copy");
    if(selector) copyText(selector);
  });

  // Delegación: descargar QR
  document.addEventListener("click", function(ev){
    const btn = ev.target.closest("[data-download-qr]");
    if(!btn) return;
    const canvasSel = btn.getAttribute("data-download-qr");
    const filename = btn.getAttribute("data-filename") || "qr.png";
    const canvas = document.querySelector(canvasSel);
    if(!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = filename;
    link.click();
  });

  // -------- Generación de EPC QR (SEPA) --------
  // Formato EPC069-12 (QR SEPA) sin BIC (opcional desde 2014)
  // Estructura:
  // BCD\n001\n1\nSCT\n<BIC>\n<NOMBRE>\n<IBAN>\nEUR<IMPORTE>\n\n<REMESA>\n
  function epcPayload({name, iban, amount, remittance, bic=""}){
    const clean = s => (s || "").toString().normalize("NFKD").replace(/[^\x20-\x7E]/g,"").trim();
    const fmtAmount = Number(amount).toFixed(2);
    const lines = [
      "BCD",
      "001",
      "1",
      "SCT",
      clean(bic),
      clean(name).slice(0,70),
      clean(iban).replace(/\s+/g,""),
      "EUR" + fmtAmount,
      "", // propósito (opcional)
      clean(remittance).slice(0,140)
    ];
    return lines.join("\n");
  }

  function drawQR(canvasId, text){
    try{
      if (window.QRCode && typeof window.QRCode.toCanvas === "function"){
        const canvas = document.getElementById(canvasId.replace(/^#/, ""));
        if(!canvas) return;
        window.QRCode.toCanvas(canvas, text, { errorCorrectionLevel: "M", margin: 1, scale: 4 }, function(err){
          if(err) console.error(err);
        });
      } else {
        // Fallback: mostrar texto del payload debajo si la librería no cargó
        const canvas = document.getElementById(canvasId.replace(/^#/, ""));
        if(canvas && canvas.parentElement){
          const pre = document.createElement("pre");
          pre.style.whiteSpace = "pre-wrap";
          pre.style.textAlign = "left";
          pre.style.fontSize = "12px";
          pre.style.color = "#a9b3c6";
          pre.textContent = text;
          canvas.replaceWith(pre);
        }
      }
    }catch(e){ console.error(e); }
  }

  // Datos del beneficiario
  const NAME = "FELDEN VARETH";
  const IBAN = (document.getElementById("iban-text")?.textContent || "").trim();

  // Construye y pinta los dos QR
  const payloadBlanda = epcPayload({
    name: NAME,
    iban: IBAN,
    amount: 25.00,
    remittance: "EIDOS TAPA BLANDA"
  });
  const payloadDura = epcPayload({
    name: NAME,
    iban: IBAN,
    amount: 35.00,
    remittance: "EIDOS TAPA DURA"
  });

  // Dibuja en los canvas
  drawQR("#qr-blanda", payloadBlanda);
  drawQR("#qr-dura", payloadDura);

})();
