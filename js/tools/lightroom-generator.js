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
    hslRed: document.getElementById('sl-hsl-red'),
    hslOrg: document.getElementById('sl-hsl-org'),
    hslGrn: document.getElementById('sl-hsl-grn'),
    hslBlu: document.getElementById('sl-hsl-blu'),
    splitShHue: document.getElementById('sl-split-sh-hue'),
    splitShSat: document.getElementById('sl-split-sh-sat'),
    splitHiHue: document.getElementById('sl-split-hi-hue'),
    splitHiSat: document.getElementById('sl-split-hi-sat'),
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
    hslRed: document.getElementById('val-hsl-red'),
    hslOrg: document.getElementById('val-hsl-org'),
    hslGrn: document.getElementById('val-hsl-grn'),
    hslBlu: document.getElementById('val-hsl-blu'),
    splitShHue: document.getElementById('val-split-sh-hue'),
    splitShSat: document.getElementById('val-split-sh-sat'),
    splitHiHue: document.getElementById('val-split-hi-hue'),
    splitHiSat: document.getElementById('val-split-hi-sat'),
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
      HueAdjustmentRed: 0,
      SaturationAdjustmentRed: parseInt(sliders.hslRed.value),
      LuminanceAdjustmentRed: 0,
      HueAdjustmentOrange: 0,
      SaturationAdjustmentOrange: parseInt(sliders.hslOrg.value),
      LuminanceAdjustmentOrange: 0,
      HueAdjustmentGreen: 0,
      SaturationAdjustmentGreen: parseInt(sliders.hslGrn.value),
      LuminanceAdjustmentGreen: 0,
      HueAdjustmentBlue: 0,
      SaturationAdjustmentBlue: parseInt(sliders.hslBlu.value),
      LuminanceAdjustmentBlue: 0,
      SplitToningShadowHue: parseInt(sliders.splitShHue.value),
      SplitToningShadowSaturation: parseInt(sliders.splitShSat.value),
      SplitToningHighlightHue: parseInt(sliders.splitHiHue.value),
      SplitToningHighlightSaturation: parseInt(sliders.splitHiSat.value),
      SplitToningBalance: 0
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

  // Curated Cinematic Presets Database
  const lrPresets = {
    'teal-orange': {
      temp: 15, tint: -5, exp: 0.2, con: 20, hi: -10, sh: 15, vib: 10, sat: 5,
      hslRed: 5, hslOrg: 10, hslGrn: -30, hslBlu: 25,
      splitShHue: 35, splitShSat: 15, splitHiHue: 215, splitHiSat: 25
    },
    'vintage': {
      temp: 20, tint: 10, exp: -0.1, con: -15, hi: -25, sh: 30, vib: -20, sat: -10,
      hslRed: 10, hslOrg: 15, hslGrn: -40, hslBlu: -30,
      splitShHue: 45, splitShSat: 10, splitHiHue: 0, splitHiSat: 0
    },
    'cyberpunk': {
      temp: -25, tint: 35, exp: 0.1, con: 30, hi: -5, sh: -10, vib: 25, sat: 15,
      hslRed: 40, hslOrg: -20, hslGrn: -55, hslBlu: 50,
      splitShHue: 190, splitShSat: 25, splitHiHue: 320, splitHiSat: 30
    },
    'chiaroscuro': {
      temp: 5, tint: 0, exp: -0.8, con: 45, hi: 10, sh: -40, vib: -15, sat: -10,
      hslRed: -10, hslOrg: 5, hslGrn: -60, hslBlu: -50,
      splitShHue: 30, splitShSat: 8, splitHiHue: 0, splitHiSat: 0
    }
  };

  // Bind Preset Click
  document.querySelectorAll('.preset-btn-lr').forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.getAttribute('data-lr-preset');
      const p = lrPresets[presetKey];
      if (!p) return;

      // Gate the feature behind PRO
      if (typeof lfAuth !== 'undefined') {
        const featureName = btn.textContent.trim().replace(' 👑', '').replace(' (PRO)', '');
        const hasAccess = lfAuth.gateFeature(featureName, () => {});
        if (!hasAccess) return; // Block if not PRO
      }

      // Apply values to sliders and update text displays
      Object.keys(p).forEach(key => {
        if (sliders[key]) {
          sliders[key].value = p[key];
          if (values[key]) {
            values[key].textContent = p[key];
          }
        }
      });

      if (currentImage) applyFilters();
    });
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
   
   <crs:HueAdjustmentRed>${params.HueAdjustmentRed}</crs:HueAdjustmentRed>
   <crs:SaturationAdjustmentRed>${params.SaturationAdjustmentRed}</crs:SaturationAdjustmentRed>
   <crs:LuminanceAdjustmentRed>${params.LuminanceAdjustmentRed}</crs:LuminanceAdjustmentRed>
   <crs:HueAdjustmentOrange>${params.HueAdjustmentOrange}</crs:HueAdjustmentOrange>
   <crs:SaturationAdjustmentOrange>${params.SaturationAdjustmentOrange}</crs:SaturationAdjustmentOrange>
   <crs:LuminanceAdjustmentOrange>${params.LuminanceAdjustmentOrange}</crs:LuminanceAdjustmentOrange>
   <crs:HueAdjustmentGreen>${params.HueAdjustmentGreen}</crs:HueAdjustmentGreen>
   <crs:SaturationAdjustmentGreen>${params.SaturationAdjustmentGreen}</crs:SaturationAdjustmentGreen>
   <crs:LuminanceAdjustmentGreen>${params.LuminanceAdjustmentGreen}</crs:LuminanceAdjustmentGreen>
   <crs:HueAdjustmentBlue>${params.HueAdjustmentBlue}</crs:HueAdjustmentBlue>
   <crs:SaturationAdjustmentBlue>${params.SaturationAdjustmentBlue}</crs:SaturationAdjustmentBlue>
   <crs:LuminanceAdjustmentBlue>${params.LuminanceAdjustmentBlue}</crs:LuminanceAdjustmentBlue>

   <crs:SplitToningShadowHue>${params.SplitToningShadowHue}</crs:SplitToningShadowHue>
   <crs:SplitToningShadowSaturation>${params.SplitToningShadowSaturation}</crs:SplitToningShadowSaturation>
   <crs:SplitToningHighlightHue>${params.SplitToningHighlightHue}</crs:SplitToningHighlightHue>
   <crs:SplitToningHighlightSaturation>${params.SplitToningHighlightSaturation}</crs:SplitToningHighlightSaturation>
   <crs:SplitToningBalance>${params.SplitToningBalance}</crs:SplitToningBalance>
   
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
