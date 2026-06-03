;(function () {
  "use strict";

  // -------- Utilidades UI --------
  function flash(message){
    const n = document.createElement("div");
    n.textContent = message;
    n.setAttribute("role", "status");
    Object.assign(n.style, {
      position:"fixed", zIndex:"9999", left:"50%", top:"18px", transform:"translateX(-50%)",
      background:"linear-gradient(135deg,#8ab4ff,#b5ffd9)", color:"#0b1220",
      fontWeight:"800", padding:"10px 14px", borderRadius:"12px",
      boxShadow:"0 10px 30px rgba(0,0,0,.25)"
    });
    document.body.appendChild(n);
    setTimeout(()=>{ n.style.opacity="0"; n.style.transition="opacity .35s ease"; }, 1400);
    setTimeout(()=>{ n.remove(); }, 1900);
  }

  // Copiar texto (IBAN)
  function copyText(selector){
    const el = document.querySelector(selector);
    if(!el) return;
    const txt = (el.innerText || el.textContent || "").replace(/\u00A0/g," ");
    if (!txt) return;
    if (navigator.clipboard?.writeText){
      navigator.clipboard.writeText(txt).then(()=> flash("IBAN copiado")).catch(fallbackCopy);
    } else fallbackCopy();
    function fallbackCopy(){
      const ta = document.createElement("textarea");
      ta.value = txt; ta.readOnly = true;
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

  // -------- Helpers EPC / IBAN --------
  const asciiClean = s => (s || "").toString()
    .normalize("NFKD").replace(/[^\x20-\x7E]/g,"").trim();

  // Normaliza: quita espacios, NBSP, guiones, etc. y pasa a mayúsculas
  function normalizeIBAN(raw){
    return (raw || "")
      .replace(/\u00A0/g," ")      // NBSP -> espacio
      .replace(/[\s\-]/g,"")       // espacios y guiones
      .toUpperCase();
  }

  // Valida IBAN (módulo 97). Devuelve true/false
  function isValidIBAN(iban){
    const clean = normalizeIBAN(iban);
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(clean)) return false;
    const rearranged = clean.slice(4) + clean.slice(0,4);
    const expanded = rearranged.replace(/[A-Z]/g, ch => (ch.charCodeAt(0) - 55).toString());
    // cálculo mod 97 en bloques para no desbordar
    let remainder = 0;
    for (let i = 0; i < expanded.length; i += 7) {
      remainder = parseInt(String(remainder) + expanded.substr(i, 7), 10) % 97;
    }
    return remainder === 1;
  }

  // EPC069-12 (sin BIC)
  // BCD\n001\n1\nSCT\n<BIC>\n<NOMBRE>\n<IBAN>\nEUR<IMPORTE>\n\n<REMESA>
  function epcPayload({name, iban, amount, remittance, bic=""}){
    const lines = [
      "BCD",
      "001",
      "1",
      "SCT",
      asciiClean(bic),
      asciiClean(name).slice(0,70),
      normalizeIBAN(iban),
      "EUR" + Number(amount).toFixed(2),
      "",
      asciiClean(remittance).slice(0,140)
    ];
    return lines.join("\n");
  }

  function drawQR(canvasId, text){
    try{
      const canvas = document.getElementById(canvasId.replace(/^#/, ""));
      if(!canvas) return;
      if (window.QRCode?.toCanvas){
        window.QRCode.toCanvas(canvas, text, { errorCorrectionLevel: "M", margin: 1, scale: 4 }, err => { if(err) console.error(err); });
      } else {
        const pre = document.createElement("pre");
        pre.style.whiteSpace = "pre-wrap";
        pre.style.textAlign = "left";
        pre.style.fontSize = "12px";
        pre.style.color = "#a9b3c6";
        pre.textContent = text;
        canvas.replaceWith(pre);
      }
    }catch(e){ console.error(e); }
  }

  // -------- Datos --------
  const NAME = "FE VA"; // o "FEDERICO VALDIVIA" si lo prefieres
  const IBAN_TEXT = (document.getElementById("iban-text")?.textContent || "").trim();
  const IBAN = normalizeIBAN(IBAN_TEXT);

  if (!isValidIBAN(IBAN)) {
    console.warn("IBAN no válido para EPC:", IBAN);
    flash("Atención: IBAN no válido");
  }

  // QR Tapa blanda (25 €)
  const payloadBlanda = epcPayload({
    name: NAME,
    iban: IBAN,
    amount: 25.00,
    remittance: "EIDOS TAPA BLANDA"
  });

  // QR Tapa dura (35 €)
  const payloadDura = epcPayload({
    name: NAME,
    iban: IBAN,
    amount: 35.00,
    remittance: "EIDOS TAPA DURA"
  });

  drawQR("#qr-blanda", payloadBlanda);
  drawQR("#qr-dura", payloadDura);
})();

