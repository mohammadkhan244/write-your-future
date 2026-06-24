// ── Favicon radar (runs before DOM ready) ─────────
(function () {
  var canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 64;
  var ctx = canvas.getContext('2d');
  var cx = 32, cy = 32, r = 28, angle = 0;
  var dots = [
    { a: 0.8, d: 0.55 }, { a: 1.4, d: 0.75 }, { a: 2.1, d: 0.45 },
    { a: 3.5, d: 0.65 }, { a: 4.2, d: 0.80 }, { a: 5.1, d: 0.50 }
  ];
  function drawFavicon() {
    ctx.clearRect(0, 0, 64, 64);
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath(); ctx.arc(cx, cy, 32, 0, Math.PI * 2); ctx.fill();
    [0.35, 0.65, 1].forEach(function (s) {
      ctx.beginPath(); ctx.arc(cx, cy, r * s, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(184,115,51,0.2)'; ctx.lineWidth = 0.8; ctx.stroke();
    });
    ctx.strokeStyle = 'rgba(184,115,51,0.12)'; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke();
    dots.forEach(function (dot) {
      var delta = angle - dot.a; if (delta < 0) delta += Math.PI * 2;
      var decay = 1 - delta / (Math.PI * 2);
      if (decay > 0.02) {
        ctx.beginPath();
        ctx.arc(cx + Math.cos(dot.a) * r * dot.d, cy + Math.sin(dot.a) * r * dot.d, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(184,115,51,' + (decay * 0.9) + ')'; ctx.fill();
      }
    });
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
    var g = ctx.createLinearGradient(0, 0, r, 0);
    g.addColorStop(0, 'rgba(184,115,51,0.7)'); g.addColorStop(1, 'rgba(184,115,51,0)');
    ctx.strokeStyle = g; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r, 0); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle - 0.6, angle); ctx.closePath();
    ctx.fillStyle = 'rgba(184,115,51,0.06)'; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI * 2); ctx.fillStyle = '#b87333'; ctx.fill();
    angle = (angle + 0.06) % (Math.PI * 2);
    var link = document.getElementById('favicon-link');
    if (link) link.href = canvas.toDataURL('image/png');
  }
  setInterval(drawFavicon, 50); drawFavicon();
}());

// ── Page logic ────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {

  // Loading radar canvas
  (function () {
    var canvas = document.getElementById('radar-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var cx = 40, cy = 40, r = 32, angle = 0;
    var dots = [
      { a: 0.8, d: 0.55 }, { a: 1.4, d: 0.75 }, { a: 2.1, d: 0.45 },
      { a: 3.5, d: 0.65 }, { a: 4.2, d: 0.80 }, { a: 5.1, d: 0.50 }
    ];
    function draw() {
      ctx.clearRect(0, 0, 80, 80);
      ctx.fillStyle = '#0a0a0a';
      ctx.beginPath(); ctx.arc(cx, cy, 40, 0, Math.PI * 2); ctx.fill();
      [0.35, 0.65, 1].forEach(function (s) {
        ctx.beginPath(); ctx.arc(cx, cy, r * s, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(184,115,51,0.25)'; ctx.lineWidth = 1; ctx.stroke();
      });
      ctx.strokeStyle = 'rgba(184,115,51,0.15)'; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke();
      dots.forEach(function (dot) {
        var delta = angle - dot.a; if (delta < 0) delta += Math.PI * 2;
        var decay = 1 - delta / (Math.PI * 2);
        if (decay > 0.02) {
          ctx.beginPath();
          ctx.arc(cx + Math.cos(dot.a) * r * dot.d, cy + Math.sin(dot.a) * r * dot.d, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(184,115,51,' + (decay * 0.9) + ')'; ctx.fill();
        }
      });
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
      var g = ctx.createLinearGradient(0, 0, r, 0);
      g.addColorStop(0, 'rgba(184,115,51,0.8)'); g.addColorStop(1, 'rgba(184,115,51,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r, 0); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle - 0.6, angle); ctx.closePath();
      ctx.fillStyle = 'rgba(184,115,51,0.07)'; ctx.fill(); ctx.restore();
      ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2); ctx.fillStyle = '#b87333'; ctx.fill();
      angle = (angle + 0.06) % (Math.PI * 2);
    }
    setInterval(draw, 50); draw();
  }());

  // URL params
  var params    = new URLSearchParams(location.search);
  var sessionId = params.get('session');
  var isPaid    = params.get('paid') === 'true';
  var isAdmin   = params.get('admin') === 'true';

  var reportData = null;

  // ── State management ─────────────────────────────
  function showState(id) {
    document.querySelectorAll('.state').forEach(function (el) {
      el.classList.remove('active');
    });
    document.getElementById(id).classList.add('active');
  }

  // ── Helpers ──────────────────────────────────────
  function showToast(msg) {
    var t = document.getElementById('share-toast');
    t.textContent = msg;
    t.classList.add('visible');
    setTimeout(function () { t.classList.remove('visible'); }, 2500);
  }

  function downloadReport(text) {
    var blob = new Blob([text], { type: 'text/plain' });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href = url;
    a.download = 'default-narrative-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ── CHANGE 1: renderReport ────────────────────────
  function renderReport(text, container) {
    container.innerHTML = '';
    var blocks = text.split(/\n\n+/);
    blocks.forEach(function (block) {
      var trimmed = block.trim();
      if (!trimmed) return;
      if (trimmed.startsWith('## ')) {
        var h2 = document.createElement('h2');
        h2.textContent = trimmed.replace(/^## /, '');
        h2.style.cssText = 'font-family:Georgia,serif;font-size:clamp(1.1rem,2.5vw,1.5rem);color:#b87333;letter-spacing:0.08em;text-transform:uppercase;margin:32px 0 12px;font-weight:normal;';
        container.appendChild(h2);
      } else if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.slice(2, -2).includes('**')) {
        var h3 = document.createElement('h3');
        h3.textContent = trimmed.slice(2, -2);
        h3.style.cssText = 'font-family:Georgia,serif;font-size:1rem;color:#f0ece4;font-weight:bold;margin:20px 0 6px;';
        container.appendChild(h3);
      } else {
        var p = document.createElement('p');
        p.innerHTML = trimmed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        p.style.cssText = 'font-family:Georgia,serif;font-size:1rem;color:rgba(240,236,228,0.88);line-height:1.75;margin-bottom:16px;';
        container.appendChild(p);
      }
    });
  }

  // ── CHANGE 2: renderTeaser ────────────────────────
  function renderTeaser(reportText, narrativeName, sid) {
    var blocks = reportText.split(/\n\n+/).map(function (b) { return b.trim(); }).filter(Boolean);

    var lensBlocks = [];
    var afterLensBlocks = [];
    var inLens = false;
    var lensEnded = false;

    blocks.forEach(function (block) {
      if (/^## THE LENS/i.test(block)) {
        inLens = true;
        return;
      }
      if (inLens && !lensEnded) {
        if (block.startsWith('## ')) {
          lensEnded = true;
          afterLensBlocks.push(block);
        } else {
          lensBlocks.push(block);
        }
      } else if (lensEnded) {
        afterLensBlocks.push(block);
      }
    });

    if (lensBlocks.length === 0) {
      lensBlocks = blocks.slice(0, 2);
      afterLensBlocks = blocks.slice(2);
    }

    var container = document.getElementById('report-content');
    container.innerHTML = '';

    // Narrative name
    var nameEl = document.createElement('div');
    nameEl.style.cssText = 'margin-bottom:32px;';
    nameEl.innerHTML =
      '<div style="font-size:0.65rem;letter-spacing:0.18em;text-transform:uppercase;color:#b87333;margin-bottom:12px;">YOUR DEFAULT NARRATIVE</div>' +
      '<h1 style="font-family:Georgia,serif;font-size:clamp(2.2rem,6vw,4rem);color:#f0ece4;font-weight:normal;line-height:1.2;margin:0;">' + narrativeName + '</h1>';
    container.appendChild(nameEl);

    // THE LENS label
    var lensLabel = document.createElement('h2');
    lensLabel.textContent = 'THE LENS';
    lensLabel.style.cssText = 'font-family:Georgia,serif;font-size:clamp(1.1rem,2.5vw,1.5rem);color:#b87333;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 16px;font-weight:normal;';
    container.appendChild(lensLabel);

    // Visible lens content
    var lensContainer = document.createElement('div');
    lensBlocks.forEach(function (block) {
      var p = document.createElement('p');
      p.innerHTML = block.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      p.style.cssText = 'font-family:Georgia,serif;font-size:1rem;color:rgba(240,236,228,0.88);line-height:1.75;margin-bottom:16px;';
      lensContainer.appendChild(p);
    });
    container.appendChild(lensContainer);

    // Divider
    var divider = document.createElement('hr');
    divider.style.cssText = 'border:none;border-top:1px solid rgba(240,236,228,0.08);margin:32px 0;';
    container.appendChild(divider);

    // Blurred section
    var blurWrapper = document.createElement('div');
    blurWrapper.style.cssText = 'position:relative;height:280px;overflow:hidden;pointer-events:none;user-select:none;';

    var blurContent = document.createElement('div');
    blurContent.style.cssText = 'filter:blur(5px);opacity:0.5;';
    afterLensBlocks.slice(0, 6).forEach(function (block) {
      var p = document.createElement('p');
      p.innerHTML = block.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      p.style.cssText = 'font-family:Georgia,serif;font-size:1rem;color:rgba(240,236,228,0.88);line-height:1.75;margin-bottom:16px;';
      blurContent.appendChild(p);
    });
    blurWrapper.appendChild(blurContent);

    var fadeOverlay = document.createElement('div');
    fadeOverlay.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:180px;background:linear-gradient(transparent,#0a0a0a);pointer-events:none;';
    blurWrapper.appendChild(fadeOverlay);
    container.appendChild(blurWrapper);

    // Lock block — CHANGE 3: Stripe opens in new tab
    var lockBlock = document.createElement('div');
    lockBlock.style.cssText = 'text-align:center;padding:40px 24px;border:1px solid rgba(184,115,51,0.25);border-radius:6px;margin-top:32px;background:rgba(184,115,51,0.04);';
    var stripeUrl = 'https://buy.stripe.com/3cI5kD3EofwM4N41e14wM04?client_reference_id=' + sid +
      '&success_url=' + encodeURIComponent('https://early-warning-system-kappa.vercel.app/report?session=' + sid + '&paid=true');
    lockBlock.innerHTML =
      '<div style="font-size:0.65rem;letter-spacing:0.18em;text-transform:uppercase;color:#b87333;margin-bottom:12px;">YOUR DEFAULT NARRATIVE REPORT</div>' +
      '<h2 style="font-family:Georgia,serif;font-size:1.4rem;color:#f0ece4;font-weight:normal;margin:0 0 12px;">See where this narrative leads.</h2>' +
      '<p style="font-size:0.9rem;color:rgba(240,236,228,0.9);line-height:1.65;margin:0 0 28px;max-width:420px;margin-left:auto;margin-right:auto;">Four vignettes — 1, 3, 5, and 10 years — showing the world this narrative builds if it stays unexamined. Written from your story, in your words.</p>' +
      '<a href="' + stripeUrl + '" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#b87333;color:#fff;border:none;border-radius:4px;padding:14px 32px;font-size:1rem;font-family:system-ui,sans-serif;letter-spacing:0.03em;cursor:pointer;text-decoration:none;">$30 — Unlock full report</a>' +
      '<p style="font-size:0.75rem;color:rgba(240,236,228,0.35);margin-top:12px;">One-time. Opens in a new tab — your data stays here.</p>';
    container.appendChild(lockBlock);

    showState('state-teaser');
  }

  // ── Render full ───────────────────────────────────
  function renderFull(data) {
    document.getElementById('full-narrative-name').textContent = data.narrativeName || '';
    renderReport(data.narrativeReport, document.getElementById('full-report-text'));

    document.getElementById('download-btn').addEventListener('click', function () {
      downloadReport(data.narrativeReport);
    });

    document.getElementById('copy-share-btn').addEventListener('click', function () {
      var url = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url)
          .then(function () { showToast('Link copied'); })
          .catch(function () { prompt('Copy link:', url); });
      } else {
        prompt('Copy link:', url);
      }
    });

    if (isAdmin) {
      document.getElementById('admin-badge').style.display = 'block';
    }

    showState('state-full');
  }

  // ── Fetch with retry ──────────────────────────────
  function fetchReport(retriesLeft) {
    fetch('/api/report-fetch?session=' + encodeURIComponent(sessionId))
      .then(function (res) {
        if (res.status === 404) {
          if (retriesLeft > 0) {
            document.getElementById('loading-label').textContent = 'Report is generating — checking again…';
            setTimeout(function () { fetchReport(retriesLeft - 1); }, 5000);
          } else {
            showState('state-error');
          }
          return null;
        }
        if (!res.ok) { showState('state-error'); return null; }
        return res.json();
      })
      .then(function (json) {
        if (!json) return;
        if (!json.success || !json.data) { showState('state-error'); return; }
        reportData = json.data;
        if (isAdmin || isPaid) {
          renderFull(reportData);
        } else {
          renderTeaser(reportData.narrativeReport, reportData.narrativeName, sessionId);
        }
      })
      .catch(function () {
        if (retriesLeft > 0) {
          setTimeout(function () { fetchReport(retriesLeft - 1); }, 5000);
        } else {
          showState('state-error');
        }
      });
  }

  // ── Init ─────────────────────────────────────────
  if (!sessionId) {
    showState('state-error');
  } else {
    fetchReport(6);
  }

});
