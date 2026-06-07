/* ==========================================================================
   LUMENFORGE — Tone Curve & Histogram Lab Logic
   Interactive tone curve editor with histogram visualization, channel
   support, presets, and real-time SVG filter preview.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ─── DOM References ───────────────────────────────────────────────────
  const curveCanvas  = document.getElementById('tc-curve-canvas');
  const histCanvas   = document.getElementById('tc-histogram-canvas');
  const canvasWrap   = document.getElementById('tc-canvas-wrap');
  const pointInfo    = document.getElementById('tc-point-info');
  const previewEl    = document.getElementById('tc-preview');
  const filterOverlay = document.getElementById('tc-filter-overlay');
  const outputEl     = document.getElementById('tc-output');

  // SVG filter elements
  const feFuncR = document.getElementById('tc-func-r');
  const feFuncG = document.getElementById('tc-func-g');
  const feFuncB = document.getElementById('tc-func-b');

  // HUD
  const hudCurveType = document.getElementById('hud-curve-type');
  const hudChannel   = document.getElementById('hud-channel');

  // Channel buttons
  const channelBtns = document.querySelectorAll('#channel-btns .tc-channel-btn');

  // Preset cards
  const presetCards = document.querySelectorAll('#tc-presets .radio-card');

  // Reset button
  const resetBtn = document.getElementById('btn-reset');

  // ─── Canvas Setup ─────────────────────────────────────────────────────
  const CANVAS_SIZE = 300;
  const PADDING = 0;        // drawing fills full canvas; labels are outside via CSS

  const curveCtx = curveCanvas.getContext('2d');
  const histCtx  = histCanvas.getContext('2d');

  // High-DPI scaling
  function setupCanvas(canvas, ctx, w, h) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // We use the actual rendered size of the wrapper for the canvas
  let cW = CANVAS_SIZE;
  let cH = CANVAS_SIZE;
  let hW = CANVAS_SIZE;
  let hH = 100;

  function measureAndSetup() {
    const wrapRect = canvasWrap.getBoundingClientRect();
    cW = Math.round(wrapRect.width);
    cH = Math.round(wrapRect.height);
    setupCanvas(curveCanvas, curveCtx, cW, cH);

    const histWrap = histCanvas.parentElement;
    const histRect = histWrap.getBoundingClientRect();
    hW = Math.round(histRect.width);
    hH = Math.round(histRect.height);
    setupCanvas(histCanvas, histCtx, hW, hH);
  }

  // ─── Control Points ───────────────────────────────────────────────────
  // Points are stored as { input: 0-255, output: 0-255 }
  // Each channel has its own independent set of points

  const POINT_NAMES = ['Blacks', 'Shadows', 'Midtones', 'Highlights', 'Whites'];
  const DEFAULT_INPUTS = [0, 64, 128, 192, 255];

  function defaultPoints() {
    return DEFAULT_INPUTS.map(v => ({ input: v, output: v }));
  }

  const channelPoints = {
    luminance: defaultPoints(),
    red:       defaultPoints(),
    green:     defaultPoints(),
    blue:      defaultPoints()
  };

  let activeChannel = 'luminance';
  let dragIndex = -1;
  let isInteracting = false;

  // ─── Channel Colors ───────────────────────────────────────────────────
  const CHANNEL_COLORS = {
    luminance: { main: '#F5A623', gradient: ['#F5A623', '#D4922A'], fill: 'rgba(245,166,35,0.03)' },
    red:       { main: '#FF6B6B', gradient: ['#FF6B6B', '#CC3333'], fill: 'rgba(255,107,107,0.03)' },
    green:     { main: '#69DB7C', gradient: ['#69DB7C', '#2B9348'], fill: 'rgba(105,219,124,0.03)' },
    blue:      { main: '#74C0FC', gradient: ['#74C0FC', '#3A7BD5'], fill: 'rgba(116,192,252,0.03)' }
  };

  // ─── Preset Definitions ───────────────────────────────────────────────
  const PRESETS = {
    linear:  { name: 'Linear',             points: [[0,0],[64,64],[128,128],[192,192],[255,255]] },
    matte:   { name: 'Matte Film',          points: [[0,20],[64,70],[128,130],[192,195],[255,235]] },
    noir:    { name: 'High Contrast Noir',  points: [[0,0],[64,30],[128,128],[192,220],[255,255]] },
    highkey: { name: 'High-Key Dreamy',     points: [[0,30],[64,90],[128,160],[192,210],[255,245]] },
    crushed: { name: 'Crushed Shadows',     points: [[0,0],[64,10],[128,100],[192,200],[255,255]] },
    scurve:  { name: 'S-Curve Punch',       points: [[0,0],[64,40],[128,128],[192,215],[255,255]] },
    vintage: { name: 'Faded Vintage',       points: [[0,25],[64,55],[128,120],[192,185],[255,230]] }
  };

  let currentPresetKey = 'linear';

  // ─── Fake Histogram Distribution ──────────────────────────────────────
  // Simulate a bimodal sunset scene: dark shadows for foreground, bright sky peak
  const ORIGINAL_DISTRIBUTION = generateSunsetDistribution();

  function generateSunsetDistribution() {
    const dist = new Float64Array(256);
    // Dark foreground (silhouettes + mountains): peak around 15-30
    for (let i = 0; i < 256; i++) {
      dist[i] += 1800 * Math.exp(-0.5 * Math.pow((i - 18) / 12, 2));
    }
    // Shadow detail: mild bump at 40-80
    for (let i = 0; i < 256; i++) {
      dist[i] += 600 * Math.exp(-0.5 * Math.pow((i - 60) / 22, 2));
    }
    // Warm midtones (sunset orange): broad bump 120-170
    for (let i = 0; i < 256; i++) {
      dist[i] += 1100 * Math.exp(-0.5 * Math.pow((i - 145) / 30, 2));
    }
    // Bright sky near sun: peak around 200-230
    for (let i = 0; i < 256; i++) {
      dist[i] += 1500 * Math.exp(-0.5 * Math.pow((i - 215) / 18, 2));
    }
    // Specular highlights: small spike near 250
    for (let i = 0; i < 256; i++) {
      dist[i] += 500 * Math.exp(-0.5 * Math.pow((i - 248) / 6, 2));
    }
    return dist;
  }

  // ─── Spline Interpolation (Catmull-Rom) ───────────────────────────────
  // Generates a smooth curve through control points and fills a LUT

  function catmullRomSpline(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    return 0.5 * (
      (2 * p1) +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3
    );
  }

  function buildLUT(points) {
    const lut = new Uint8Array(256);
    const n = points.length;

    // Build extended arrays for input/output
    const xs = points.map(p => p.input);
    const ys = points.map(p => p.output);

    for (let x = 0; x < 256; x++) {
      // Find which segment x falls in
      let seg = 0;
      for (let i = 0; i < n - 1; i++) {
        if (x >= xs[i] && x <= xs[i + 1]) {
          seg = i;
          break;
        }
      }

      if (xs[seg + 1] === xs[seg]) {
        lut[x] = Math.round(Math.max(0, Math.min(255, ys[seg])));
        continue;
      }

      const t = (x - xs[seg]) / (xs[seg + 1] - xs[seg]);

      // Get four points for Catmull-Rom (pad edges)
      const p0 = ys[Math.max(0, seg - 1)];
      const p1 = ys[seg];
      const p2 = ys[seg + 1];
      const p3 = ys[Math.min(n - 1, seg + 2)];

      const val = catmullRomSpline(p0, p1, p2, p3, t);
      lut[x] = Math.round(Math.max(0, Math.min(255, val)));
    }

    return lut;
  }

  // ─── Coordinate Conversion ────────────────────────────────────────────
  // input 0-255 → canvas X, output 0-255 → canvas Y (Y is inverted)

  function inputToX(input) {
    return (input / 255) * cW;
  }

  function outputToY(output) {
    return cH - (output / 255) * cH;
  }

  function xToInput(x) {
    return Math.round(Math.max(0, Math.min(255, (x / cW) * 255)));
  }

  function yToOutput(y) {
    return Math.round(Math.max(0, Math.min(255, ((cH - y) / cH) * 255)));
  }

  // ─── Drawing: Tone Curve Canvas ───────────────────────────────────────

  function drawCurve() {
    const ctx = curveCtx;
    const pts = channelPoints[activeChannel];
    const colors = CHANNEL_COLORS[activeChannel];

    // Clear
    ctx.clearRect(0, 0, cW, cH);

    // Background
    ctx.fillStyle = '#0E0D14';
    ctx.fillRect(0, 0, cW, cH);

    // Grid lines at 64-value intervals (i.e. at 25%, 50%, 75%)
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      const pos = (i / 4) * cW;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, cH);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(cW, pos);
      ctx.stroke();
    }

    // Zone markers at top
    ctx.font = `${Math.max(8, cW * 0.028)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    const zoneW = cW / 5;
    const zoneNames = ['B', 'S', 'M', 'H', 'W'];
    for (let i = 0; i < 5; i++) {
      ctx.fillText(zoneNames[i], zoneW * i + zoneW / 2, cH - 6);
    }

    // Diagonal reference line (identity: no change)
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, cH);
    ctx.lineTo(cW, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    // Build the LUT to draw smooth curve
    const lut = buildLUT(pts);

    // Fill area under curve
    ctx.beginPath();
    ctx.moveTo(0, cH);
    for (let x = 0; x < 256; x++) {
      const cx = (x / 255) * cW;
      const cy = cH - (lut[x] / 255) * cH;
      ctx.lineTo(cx, cy);
    }
    ctx.lineTo(cW, cH);
    ctx.closePath();
    ctx.fillStyle = colors.fill;
    ctx.fill();

    // Draw the curve line with gradient
    const grad = ctx.createLinearGradient(0, cH, cW, 0);
    grad.addColorStop(0, colors.gradient[1]);
    grad.addColorStop(1, colors.gradient[0]);

    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let x = 0; x < 256; x++) {
      const cx = (x / 255) * cW;
      const cy = cH - (lut[x] / 255) * cH;
      if (x === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    // Draw control points
    const pointRadius = Math.max(5, cW * 0.018);
    for (let i = 0; i < pts.length; i++) {
      const px = inputToX(pts[i].input);
      const py = outputToY(pts[i].output);
      const isActive = (i === dragIndex);

      // Glow for active point
      if (isActive) {
        ctx.beginPath();
        ctx.arc(px, py, pointRadius + 8, 0, Math.PI * 2);
        ctx.fillStyle = colors.main.replace(')', ',0.2)').replace('rgb', 'rgba').replace('#', '');
        // Use a simpler approach for glow
        const glowGrad = ctx.createRadialGradient(px, py, pointRadius, px, py, pointRadius + 12);
        glowGrad.addColorStop(0, hexToRgba(colors.main, 0.35));
        glowGrad.addColorStop(1, hexToRgba(colors.main, 0));
        ctx.fillStyle = glowGrad;
        ctx.fill();
      }

      // Point circle
      ctx.beginPath();
      ctx.arc(px, py, pointRadius, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? colors.main : hexToRgba(colors.main, 0.9);
      ctx.fill();
      ctx.strokeStyle = isActive ? '#ffffff' : 'rgba(255,255,255,0.6)';
      ctx.lineWidth = isActive ? 2.5 : 1.5;
      ctx.stroke();

      // Inner highlight dot
      if (isActive) {
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      }
    }
  }

  // ─── Drawing: Histogram ───────────────────────────────────────────────

  function drawHistogram() {
    const ctx = histCtx;
    const lut = buildLUT(channelPoints[activeChannel]);
    const colors = CHANNEL_COLORS[activeChannel];

    ctx.clearRect(0, 0, hW, hH);
    ctx.fillStyle = '#0E0D14';
    ctx.fillRect(0, 0, hW, hH);

    // Apply LUT to the original distribution
    const mapped = new Float64Array(256);
    for (let i = 0; i < 256; i++) {
      const outBin = lut[i];
      mapped[outBin] += ORIGINAL_DISTRIBUTION[i];
    }

    // Find max for normalisation
    let origMax = 0;
    let mappedMax = 0;
    for (let i = 0; i < 256; i++) {
      if (ORIGINAL_DISTRIBUTION[i] > origMax) origMax = ORIGINAL_DISTRIBUTION[i];
      if (mapped[i] > mappedMax) mappedMax = mapped[i];
    }
    const globalMax = Math.max(origMax, mappedMax, 1);

    const barW = hW / 256;

    // Draw original distribution as ghost outline
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 256; i++) {
      const x = (i / 255) * hW;
      const h = (ORIGINAL_DISTRIBUTION[i] / globalMax) * (hH - 4);
      if (i === 0) ctx.moveTo(x, hH - h);
      else ctx.lineTo(x, hH - h);
    }
    ctx.stroke();

    // Draw mapped distribution as filled bars
    const histGrad = ctx.createLinearGradient(0, hH, 0, 0);
    histGrad.addColorStop(0, hexToRgba(colors.main, 0.6));
    histGrad.addColorStop(1, hexToRgba(colors.main, 0.15));

    for (let i = 0; i < 256; i++) {
      const x = (i / 255) * hW;
      const h = (mapped[i] / globalMax) * (hH - 4);
      if (h > 0.5) {
        ctx.fillStyle = histGrad;
        ctx.fillRect(x, hH - h, Math.max(barW, 1.2), h);
      }
    }

    // Top edge glow on the mapped bars
    ctx.strokeStyle = hexToRgba(colors.main, 0.5);
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 256; i++) {
      const x = (i / 255) * hW;
      const h = (mapped[i] / globalMax) * (hH - 4);
      if (i === 0) ctx.moveTo(x, hH - h);
      else ctx.lineTo(x, hH - h);
    }
    ctx.stroke();
  }

  // ─── Preview Update via SVG feComponentTransfer ───────────────────────

  function updatePreview() {
    // Build LUTs for all channels
    const lumLut = buildLUT(channelPoints.luminance);
    const rLut   = buildLUT(channelPoints.red);
    const gLut   = buildLUT(channelPoints.green);
    const bLut   = buildLUT(channelPoints.blue);

    // Combine: luminance applies to all channels, then channel-specific curve on top
    const combinedR = new Uint8Array(256);
    const combinedG = new Uint8Array(256);
    const combinedB = new Uint8Array(256);

    for (let i = 0; i < 256; i++) {
      // Apply luminance first, then channel curve
      combinedR[i] = rLut[lumLut[i]];
      combinedG[i] = gLut[lumLut[i]];
      combinedB[i] = bLut[lumLut[i]];
    }

    // Convert LUTs to SVG tableValues (normalized 0..1)
    const rTable = Array.from(combinedR).map(v => (v / 255).toFixed(4)).join(' ');
    const gTable = Array.from(combinedG).map(v => (v / 255).toFixed(4)).join(' ');
    const bTable = Array.from(combinedB).map(v => (v / 255).toFixed(4)).join(' ');

    feFuncR.setAttribute('tableValues', rTable);
    feFuncG.setAttribute('tableValues', gTable);
    feFuncB.setAttribute('tableValues', bTable);

    // Apply filter to the preview viewport's children (the scene)
    const previewViewport = document.getElementById('tc-preview');
    previewViewport.style.filter = 'url(#tc-curve-filter)';

    // Update HUD
    hudChannel.textContent = activeChannel.charAt(0).toUpperCase() + activeChannel.slice(1);
  }

  // ─── Analysis Output ─────────────────────────────────────────────────

  function renderAnalysis() {
    const pts = channelPoints.luminance;
    const lut = buildLUT(pts);

    // Analyze curve characteristics
    const blacks     = pts[0].output;
    const shadows    = pts[1].output;
    const midtones   = pts[2].output;
    const highlights = pts[3].output;
    const whites     = pts[4].output;

    // Determine curve qualities
    let blacksDesc = '';
    if (blacks > 10) blacksDesc = `Vùng đen (Blacks) được <strong>nâng lên ${blacks}</strong> — tạo hiệu ứng faded/matte, vùng tối nhất không còn đen tuyệt đối.`;
    else if (blacks === 0) blacksDesc = 'Vùng đen (Blacks) giữ nguyên ở mức <strong>0 tuyệt đối</strong> — đen sâu thẳm, tương phản tối đa.';

    let shadowsDesc = '';
    const shadowDiff = shadows - 64;
    if (shadowDiff > 15) shadowsDesc = `Vùng bóng tối (Shadows) được <strong>mở sáng +${shadowDiff}</strong> — chi tiết vùng tối hiện rõ hơn, không gian thoáng đãng.`;
    else if (shadowDiff < -15) shadowsDesc = `Vùng bóng tối (Shadows) bị <strong>nén tối ${shadowDiff}</strong> — tạo chiều sâu kịch tính, bóng đổ dày đặc hơn.`;
    else shadowsDesc = 'Vùng bóng tối (Shadows) gần như <strong>trung tính</strong> — giữ nguyên cân bằng tự nhiên.';

    let midDesc = '';
    const midDiff = midtones - 128;
    if (midDiff > 15) midDesc = `Midtones được <strong>đẩy sáng +${midDiff}</strong> — tổng thể ảnh tươi sáng, rộng mở hơn.`;
    else if (midDiff < -15) midDesc = `Midtones bị <strong>kéo tối ${midDiff}</strong> — tổng thể ảnh u ám, đậm đà và tập trung hơn.`;
    else midDesc = 'Midtones <strong>cân bằng</strong> — giữ độ sáng tổng thể ổn định.';

    let highDesc = '';
    const highDiff = highlights - 192;
    if (highDiff > 10) highDesc = `Highlights được <strong>nâng cao +${highDiff}</strong> — vùng sáng rực rỡ hơn, có thể hơi nguy hiểm gần ngưỡng cháy sáng.`;
    else if (highDiff < -10) highDesc = `Highlights bị <strong>nén lại ${highDiff}</strong> — thu hồi chi tiết vùng sáng, skin tone mềm mại hơn.`;
    else highDesc = 'Highlights giữ <strong>nguyên bản</strong> — vùng sáng trung thực.';

    let whitesDesc = '';
    if (whites < 240) whitesDesc = `Whites bị <strong>giới hạn ở ${whites}</strong> — tông màu pastel mềm mại, ảnh thiếu tương phản ở vùng sáng nhất.`;
    else if (whites === 255) whitesDesc = 'Whites đạt <strong>255 tối đa</strong> — trắng tinh khiết, dải tương phản đầy đủ.';

    // Determine overall mood & film comparison
    let moodTitle = '';
    let filmCompare = '';
    const isLinear = blacks === 0 && shadows === 64 && midtones === 128 && highlights === 192 && whites === 255;
    const isMatte = blacks > 15 && whites < 245;
    const isSCurve = shadows < 55 && highlights > 200;
    const isHighKey = midtones > 150;
    const isCrushed = shadows < 30 && blacks <= 5;

    if (isLinear) {
      moodTitle = 'Tuyến tính — Không can thiệp';
      filmCompare = 'Đường cong tuyến tính thuần túy, không áp dụng bất kỳ điều chỉnh nào. Đây là trạng thái "flat" nguyên bản trước khi color grade.';
    } else if (isMatte && !isSCurve) {
      moodTitle = 'Matte / Faded — Hoài niệm';
      filmCompare = 'Đường cong này gợi nhớ đến <strong>Kodak Portra 400</strong> với vùng tối được nâng lên nhẹ nhàng và highlights không chạm trắng tuyệt đối. Cảm giác film analog, mềm mại, đầy hoài niệm.';
    } else if (isSCurve && blacks <= 5) {
      moodTitle = 'S-Curve — Năng lượng mạnh';
      filmCompare = 'Đường cong S kinh điển tăng tương phản vùng giữa, gợi nhớ <strong>Fujifilm Velvia</strong> với màu sắc bão hòa và tương phản cao. Rất phổ biến trong nhiếp ảnh phong cảnh và thời trang.';
    } else if (isHighKey) {
      moodTitle = 'High-Key — Nhẹ nhàng bay bổng';
      filmCompare = 'Đường cong high-key đẩy toàn bộ tông lên sáng, tạo cảm giác airy và dreamy. Thường thấy trong nhiếp ảnh chân dung beauty và thời trang cao cấp, gợi nhớ <strong>phim Cinestill 50D</strong>.';
    } else if (isCrushed) {
      moodTitle = 'Crushed Shadows — Tương phản cực đoan';
      filmCompare = 'Vùng tối bị ép nặng tạo bóng đen đặc, gợi nhớ phong cách <strong>Ilford HP5+</strong> push process hoặc cảnh noir cổ điển. Kịch tính, bí ẩn, đầy uy lực thị giác.';
    } else {
      moodTitle = 'Custom Curve — Phong cách cá nhân';
      filmCompare = 'Đường cong tùy chỉnh không thuộc nhóm cổ điển nào. Đây là dấu ấn riêng — hãy thử nghiệm và lắng nghe cảm xúc thị giác mà nó mang lại.';
    }

    // Calculate contrast estimate
    const slope50 = (lut[140] - lut[120]) / 20;  // slope around midpoint
    let contrastLabel = 'trung bình';
    if (slope50 > 1.3) contrastLabel = '<span style="color:var(--accent-amber);">cao</span>';
    else if (slope50 < 0.7) contrastLabel = '<span style="color:var(--accent-cyan);">thấp</span>';

    const outputHTML = `
      <div class="output-header" style="margin-bottom: var(--space-md); padding-bottom: var(--space-md);">
        <h3>Phân Tích Đường Cong: <span style="color: var(--accent-amber); font-family: var(--font-mono);">${moodTitle}</span></h3>
        <p style="font-size:0.82rem; color:var(--text-secondary); margin-top:4px;">
          Tương phản vùng giữa (Midtone Contrast): <strong>${contrastLabel}</strong>
        </p>
      </div>

      <div class="output-grid">
        <div class="output-card">
          <h4>🎭 Cảm Xúc Thị Giác</h4>
          <p>${filmCompare}</p>
        </div>

        <div class="output-card">
          <h4>🔬 Phân Tích Vùng Tông (Zone Analysis)</h4>
          <ul style="margin-top: 8px;">
            <li>${blacksDesc || 'Blacks: trung tính.'}</li>
            <li>${shadowsDesc}</li>
            <li>${midDesc}</li>
            <li>${highDesc}</li>
            <li>${whitesDesc || 'Whites: đạt dải đầy đủ.'}</li>
          </ul>
        </div>

        <div class="output-card">
          <h4>📊 Dữ Liệu Kỹ Thuật</h4>
          <ul>
            <li><strong>Blacks:</strong> In 0 → Out ${blacks}</li>
            <li><strong>Shadows:</strong> In 64 → Out ${shadows}</li>
            <li><strong>Midtones:</strong> In 128 → Out ${midtones}</li>
            <li><strong>Highlights:</strong> In 192 → Out ${highlights}</li>
            <li><strong>Whites:</strong> In 255 → Out ${whites}</li>
          </ul>
        </div>

        <div class="output-card pro-tip">
          <h4>💡 Mẹo Chuyên Gia (Pro Tip)</h4>
          <p>${getProTip(blacks, shadows, midtones, highlights, whites)}</p>
        </div>
      </div>
    `;

    outputEl.innerHTML = outputHTML;
  }

  function getProTip(blacks, shadows, midtones, highlights, whites) {
    if (blacks > 15 && whites < 240) {
      return 'Khi nâng Blacks và hạ Whites cùng lúc, bạn đang tạo "dải tông hẹp" (narrow tonal range) — kỹ thuật đặc trưng của phim analog. Để tăng chiều sâu, hãy giữ Shadows thấp hơn Midtones ít nhất 40 đơn vị.';
    }
    if (shadows < 40 && highlights > 210) {
      return 'Đường cong S mạnh tạo "pop" cho ảnh nhưng có thể mất chi tiết ở cả hai đầu. Trong Lightroom/Capture One, kết hợp với việc giảm Clarity -10 để giữ skin tone mềm mại khi dùng S-curve.';
    }
    if (midtones > 150) {
      return 'Midtones cao tạo cảm giác "airy" rất đẹp nhưng dễ bị wash-out. Bí quyết: đặt Blacks ở 0 tuyệt đối để giữ anchor point cho mắt người xem, tạo tương phản ẩn dù tổng thể sáng.';
    }
    return 'Thử kéo điểm Shadows xuống 40 và Highlights lên 215 để tạo S-curve — đây là điều chỉnh phổ biến nhất trong hậu kỳ chuyên nghiệp, giúp ảnh "sống" hơn ngay lập tức mà không cần bất kỳ plugin nào.';
  }

  // ─── Utility ──────────────────────────────────────────────────────────

  function hexToRgba(hex, alpha) {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // ─── Mouse & Touch Interaction ────────────────────────────────────────

  function getCanvasCoords(e) {
    const rect = curveCanvas.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function findNearestPoint(x, y) {
    const pts = channelPoints[activeChannel];
    const hitRadius = Math.max(18, cW * 0.06);
    let nearest = -1;
    let minDist = Infinity;

    for (let i = 0; i < pts.length; i++) {
      const px = inputToX(pts[i].input);
      const py = outputToY(pts[i].output);
      const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      if (dist < hitRadius && dist < minDist) {
        minDist = dist;
        nearest = i;
      }
    }
    return nearest;
  }

  function onPointerDown(e) {
    e.preventDefault();
    const coords = getCanvasCoords(e);
    const idx = findNearestPoint(coords.x, coords.y);

    if (idx >= 0) {
      dragIndex = idx;
      isInteracting = true;
      curveCanvas.classList.add('grabbing');
      curveCanvas.classList.remove('grab');

      // Show point info
      const pts = channelPoints[activeChannel];
      pointInfo.textContent = `${POINT_NAMES[idx]}: In ${pts[idx].input} → Out ${pts[idx].output}`;
      pointInfo.classList.add('visible');

      drawCurve();
    }
  }

  function onPointerMove(e) {
    const coords = getCanvasCoords(e);

    if (isInteracting && dragIndex >= 0) {
      e.preventDefault();
      const pts = channelPoints[activeChannel];

      // Update output based on Y position
      pts[dragIndex].output = yToOutput(coords.y);

      // For endpoints, allow slight horizontal movement too
      if (dragIndex === 0) {
        // Blacks: input constrained 0-20
        pts[dragIndex].input = Math.max(0, Math.min(20, xToInput(coords.x)));
      } else if (dragIndex === pts.length - 1) {
        // Whites: input constrained 235-255
        pts[dragIndex].input = Math.max(235, Math.min(255, xToInput(coords.x)));
      }
      // Middle points: input stays fixed (vertical only)

      // Update point info
      pointInfo.textContent = `${POINT_NAMES[dragIndex]}: In ${pts[dragIndex].input} → Out ${pts[dragIndex].output}`;

      // Switch to custom preset
      switchToCustom();

      drawCurve();
      drawHistogram();
      updatePreview();
    } else {
      // Hover cursor
      const idx = findNearestPoint(coords.x, coords.y);
      if (idx >= 0) {
        curveCanvas.classList.add('grab');
      } else {
        curveCanvas.classList.remove('grab');
      }
    }
  }

  function onPointerUp(e) {
    if (isInteracting) {
      isInteracting = false;
      dragIndex = -1;
      curveCanvas.classList.remove('grabbing');
      pointInfo.classList.remove('visible');

      renderAnalysis();
    }
  }

  // Mouse events
  curveCanvas.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  // Touch events
  curveCanvas.addEventListener('touchstart', onPointerDown, { passive: false });
  window.addEventListener('touchmove', onPointerMove, { passive: false });
  window.addEventListener('touchend', onPointerUp);

  // ─── Channel Switching ────────────────────────────────────────────────

  channelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      channelBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeChannel = btn.dataset.channel;

      drawCurve();
      drawHistogram();
      updatePreview();
      renderAnalysis();
    });
  });

  // ─── Preset Handling ──────────────────────────────────────────────────

  presetCards.forEach(card => {
    const input = card.querySelector('input[type="radio"]');

    card.addEventListener('click', (e) => {
      if (e.target !== input) {
        input.checked = true;
      }

      presetCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      const presetKey = input.value;
      applyPreset(presetKey);
    });
  });

  function applyPreset(key) {
    const preset = PRESETS[key];
    if (!preset) return;

    currentPresetKey = key;
    hudCurveType.textContent = preset.name;

    // Apply preset points to ALL channels (reset channel-specific curves)
    ['luminance', 'red', 'green', 'blue'].forEach(ch => {
      channelPoints[ch] = preset.points.map(p => ({ input: p[0], output: p[1] }));
    });

    drawCurve();
    drawHistogram();
    updatePreview();
    renderAnalysis();
  }

  function switchToCustom() {
    if (currentPresetKey === 'custom') return;
    currentPresetKey = 'custom';
    hudCurveType.textContent = 'Custom';

    // Deselect all preset cards (none will be "custom" since there's no custom card)
    presetCards.forEach(c => {
      c.classList.remove('selected');
      c.querySelector('input').checked = false;
    });
  }

  // ─── Reset Button ─────────────────────────────────────────────────────

  resetBtn.addEventListener('click', () => {
    applyPreset('linear');

    // Re-select the Linear preset card
    presetCards.forEach(c => c.classList.remove('selected'));
    const linearCard = document.querySelector('#tc-presets .radio-card:first-child');
    linearCard.classList.add('selected');
    linearCard.querySelector('input').checked = true;

    // Reset to luminance channel
    channelBtns.forEach(b => b.classList.remove('active'));
    channelBtns[0].classList.add('active');
    activeChannel = 'luminance';

    drawCurve();
    drawHistogram();
    updatePreview();
    renderAnalysis();
  });

  // ─── Window Resize ────────────────────────────────────────────────────

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      measureAndSetup();
      drawCurve();
      drawHistogram();
    }, 100);
  });

  // ─── Initialize ───────────────────────────────────────────────────────

  measureAndSetup();
  drawCurve();
  drawHistogram();
  updatePreview();
  renderAnalysis();
});
