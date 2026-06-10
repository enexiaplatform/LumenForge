/* ==========================================================================
   LUMENFORGE — Lightroom Preset Generator (XMP Export)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('file-input');
  const uploadOverlay = document.getElementById('upload-overlay');
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  let currentImage = null;

  // Sliders
  const sliders = {
    temp: document.getElementById('sl-temp'),
    tint: document.getElementById('sl-tint'),
    exp: document.getElementById('sl-exp'),
    con: document.getElementById('sl-con'),
    hi: document.getElementById('sl-hi'),
    sh: document.getElementById('sl-sh'),
    vib: document.getElementById('sl-vib'),
    sat: document.getElementById('sl-sat'),
  };

  const values = {
    temp: document.getElementById('val-temp'),
    tint: document.getElementById('val-tint'),
    exp: document.getElementById('val-exp'),
    con: document.getElementById('val-con'),
    hi: document.getElementById('val-hi'),
    sh: document.getElementById('val-sh'),
    vib: document.getElementById('val-vib'),
    sat: document.getElementById('val-sat'),
  };

  // Setup Event Listeners for sliders
  Object.keys(sliders).forEach(key => {
    sliders[key].addEventListener('input', () => {
      values[key].textContent = sliders[key].value;
      if (currentImage) applyFilters();
    });
  });

  window.resetSliders = function() {
    Object.keys(sliders).forEach(key => {
      sliders[key].value = 0;
      values[key].textContent = "0";
    });
    if (currentImage) applyFilters();
  };

  // Image Upload
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        currentImage = img;
        uploadOverlay.classList.add('hidden');
        renderImage();
        applyFilters();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  window.addEventListener('resize', () => {
    if (currentImage) renderImage();
  });

  function renderImage() {
    const container = canvas.parentElement;
    const maxWidth = container.clientWidth;
    const maxHeight = container.clientHeight;

    const ratio = Math.min(maxWidth / currentImage.width, maxHeight / currentImage.height);
    const newWidth = currentImage.width * ratio;
    const newHeight = currentImage.height * ratio;

    canvas.width = newWidth;
    canvas.height = newHeight;

    ctx.drawImage(currentImage, 0, 0, newWidth, newHeight);
  }

  // Very rudimentary CSS filter approximation for real-time preview.
  // Note: True Lightroom math is much more complex, this is just a quick visual feedback!
  function applyFilters() {
    const exp = parseFloat(sliders.exp.value); // -5 to +5
    const con = parseInt(sliders.con.value); // -100 to 100
    const sat = parseInt(sliders.sat.value); // -100 to 100
    const temp = parseInt(sliders.temp.value); // -100 to 100 (warm/cool)

    // Calculate CSS equivalents
    const brightness = 100 + (exp * 20); // 1 exposure = 20% brightness
    const contrast = 100 + (con / 2); // 100 con = 150% contrast
    const saturate = 100 + (sat); // 100 sat = 200% saturate
    
    // Sepia for warmth
    let sepia = 0;
    let hueRotate = 0;
    if (temp > 0) {
      sepia = temp / 2; // up to 50% sepia
    } else if (temp < 0) {
      // cool it down
      // Not easy with standard css, so just reduce sepia and maybe hue rotate
      hueRotate = (temp / 100) * -15; // rotate a bit towards blue
    }

    canvas.style.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) sepia(${sepia}%) hue-rotate(${hueRotate}deg)`;
  }

  // Generate XMP Preset
  document.getElementById('btn-export').addEventListener('click', () => {
    const name = "LumenForge Preset";
    const xmpData = generateXMP(name, {
      Temperature: parseInt(sliders.temp.value),
      Tint: parseInt(sliders.tint.value),
      Exposure2012: parseFloat(sliders.exp.value),
      Contrast2012: parseInt(sliders.con.value),
      Highlights2012: parseInt(sliders.hi.value),
      Shadows2012: parseInt(sliders.sh.value),
      Vibrance: parseInt(sliders.vib.value),
      Saturation: parseInt(sliders.sat.value),
    });

    const blob = new Blob([xmpData], { type: 'application/rdf+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `LumenForge_Export.xmp`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // The XMP Template builder
  function generateXMP(presetName, params) {
    const uuid = 'uuid:' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    }).toUpperCase();

    // Map the sliders to Lightroom internal values. 
    // Temp and Tint are absolute in LR, not relative, but we fake it as relative here 
    // to match a preset that only changes tones.
    return `<?xml version="1.0" encoding="UTF-8"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="LumenForge Preset Generator">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/">
   <crs:PresetType>Normal</crs:PresetType>
   <crs:Cluster></crs:Cluster>
   <crs:UUID>${uuid}</crs:UUID>
   <crs:Title>
    <rdf:Alt>
     <rdf:li xml:lang="x-default">${presetName}</rdf:li>
    </rdf:Alt>
   </crs:Title>
   <crs:HasSettings>True</crs:HasSettings>
   <crs:ProcessVersion>11.0</crs:ProcessVersion>
   
   <crs:Temperature>${5000 + (params.Temperature * 20)}</crs:Temperature>
   <crs:Tint>${params.Tint}</crs:Tint>
   <crs:Exposure2012>${params.Exposure2012.toFixed(2)}</crs:Exposure2012>
   <crs:Contrast2012>${params.Contrast2012}</crs:Contrast2012>
   <crs:Highlights2012>${params.Highlights2012}</crs:Highlights2012>
   <crs:Shadows2012>${params.Shadows2012}</crs:Shadows2012>
   <crs:Whites2012>0</crs:Whites2012>
   <crs:Blacks2012>0</crs:Blacks2012>
   <crs:Clarity2012>0</crs:Clarity2012>
   <crs:Vibrance>${params.Vibrance}</crs:Vibrance>
   <crs:Saturation>${params.Saturation}</crs:Saturation>
   
   <crs:ToneCurvePV2012>
    <rdf:Seq>
     <rdf:li>0, 0</rdf:li>
     <rdf:li>255, 255</rdf:li>
    </rdf:Seq>
   </crs:ToneCurvePV2012>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
`;
  }
});
