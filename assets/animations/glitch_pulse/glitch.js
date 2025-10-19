
/* GL!TCH — Pulse of the Ledger (v1.2) */
(function(){
  const container = document.currentScript.dataset.mount
    ? document.querySelector(document.currentScript.dataset.mount)
    : document.querySelector('.glitch-banner');

  if(!container){
    console.warn('GL!TCH: .glitch-banner container not found');
    return;
  }

  // Create canvas if missing
  let canvas = container.querySelector('#glitchCanvas');
  if(!canvas){
    canvas = document.createElement('canvas');
    canvas.id = 'glitchCanvas';
    container.prepend(canvas);
  }
  const ctx = canvas.getContext('2d', {alpha:true});

  let w,h,t=0, raf;
  const DPR = Math.min(window.devicePixelRatio||1, 2);

  function resize(){
    const rect = container.getBoundingClientRect();
    w = Math.max(1, Math.floor(rect.width));
    h = Math.max(1, Math.floor(rect.height));
    canvas.width  = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  resize();
  window.addEventListener('resize', resize, {passive:true});

  // Random helpers
  const rnd = (min,max)=> Math.random()*(max-min)+min;

  function drawNoiseDots(count){
    for(let i=0;i<count;i++){
      const x = Math.random()*w;
      const y = Math.random()*h;
      const a = Math.random()*0.09;
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fillRect(x,y,1,1);
    }
  }

  function drawPulses(time){
    const cx=w/2, cy=h/2;
    const maxR = Math.max(w,h);

    for(let i=0;i<6;i++){
      const r = (time*80 + i*60) % maxR;
      const alpha = Math.max(0, 1 - r/maxR);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI*2);
      // Cyan→Violet oscillation
      const c = 126 + Math.sin(time+i)*20;  // R-ish
      const g = 229 + Math.cos(time)*10;    // G-ish
      const b = 255;                         // B-ish
      ctx.strokeStyle = `rgba(${c},${g},${b},${alpha*0.16})`;
      ctx.lineWidth = 1 + alpha*2;
      ctx.stroke();
    }
  }

  function drawCore(time){
    const cx=w/2, cy=h/2;
    const pulse = 10 + Math.sin(time*4)*3;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 70);
    grad.addColorStop(0, "rgba(126,229,255,0.42)"); // cyan
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 40 + pulse, 0, Math.PI*2);
    ctx.fill();

    // Subtle cross glitch beams
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(154,126,255,0.18)'; // violet
    ctx.lineWidth = 1;

    const len = 60 + Math.sin(time*2)*12;
    ctx.beginPath(); ctx.moveTo(cx-len,cy); ctx.lineTo(cx+len,cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx,cy-len); ctx.lineTo(cx,cy+len); ctx.stroke();

    ctx.globalCompositeOperation = 'source-over';
  }

  function draw(){
    t += 0.02;
    // Clear with slight alpha for a soft trail (motion persistence)
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.fillRect(0,0,w,h);

    drawNoiseDots(300);
    drawPulses(t);
    drawCore(t);

    raf = requestAnimationFrame(draw);
  }
  draw();

  // Cleanup if needed
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && raf) cancelAnimationFrame(raf);
    else if (!document.hidden) draw();
  });
})();
