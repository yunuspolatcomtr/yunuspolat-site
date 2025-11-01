// footer yılı
document.addEventListener('DOMContentLoaded', ()=>{
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
});

// fade-in animasyon
const fadeEls=document.querySelectorAll('.fadein');
const obs=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('appear'); }});
},{threshold:0.2});
fadeEls.forEach(el=>obs.observe(el));
// --- Başarı slider kontrolleri ---
(() => {
  const track = document.getElementById('storyTrack');
  if(!track) return;

  const prev = document.querySelector('.story-nav.prev');
  const next = document.querySelector('.story-nav.next');

  const step = () => track.clientWidth * 0.9;

  function go(dir){
    track.scrollBy({ left: dir * step(), behavior: 'smooth' });
  }
  prev?.addEventListener('click', () => go(-1));
  next?.addEventListener('click', () => go(1));

  // sürükle-kaydır (mouse/touch)
  let isDown=false, startX=0, scrollLeft=0;
  track.addEventListener('pointerdown', e=>{
    isDown=true; startX=e.clientX; scrollLeft=track.scrollLeft; track.setPointerCapture(e.pointerId);
  });
  track.addEventListener('pointermove', e=>{
    if(!isDown) return; track.scrollLeft = scrollLeft - (e.clientX - startX);
  });
  ['pointerup','pointercancel','pointerleave'].forEach(ev=>track.addEventListener(ev,()=>isDown=false));

  // klavye ile
  track.addEventListener('keydown', (e)=>{
    if(e.key==='ArrowRight') go(1);
    if(e.key==='ArrowLeft') go(-1);
  });
})();
// --- Başarı slider: dots + autoplay ---
(() => {
  const track = document.getElementById('storyTrack');
  const dotsWrap = document.getElementById('storyDots');
  if(!track || !dotsWrap) return;

  const cards = Array.from(track.querySelectorAll('.story-card'));
  const prev = document.querySelector('.story-nav.prev');
  const next = document.querySelector('.story-nav.next');
  let idx = 0, timer = null, paused = false;

  // dots oluştur
  cards.forEach((_, i)=>{
    const d = document.createElement('button');
    d.className = 'story-dot'; d.type='button'; d.ariaLabel = `Slayt ${i+1}`;
    d.addEventListener('click', ()=>goTo(i,true));
    dotsWrap.appendChild(d);
  });
  const dots = Array.from(dotsWrap.children);

  function stepSize(){ return track.clientWidth * 0.9; }
  function go(dir){ goTo((idx + dir + cards.length) % cards.length, true); }
  function goTo(i, smooth=false){
    idx = (i + cards.length) % cards.length;
    const x = cards[idx].offsetLeft - track.offsetLeft - 6; // 6: küçük padding toleransı
    track.scrollTo({ left: x, behavior: smooth ? 'smooth' : 'auto' });
    updateDots();
    restart();
  }
  function updateDots(){
    dots.forEach((d,j)=>d.classList.toggle('active', j===idx));
  }

  // scroll ile aktif kartı takip et
  let raf;
  track.addEventListener('scroll', ()=>{
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(()=>{
      let closest = 0, min = Infinity;
      cards.forEach((c,i)=>{
        const dist = Math.abs(c.getBoundingClientRect().left - track.getBoundingClientRect().left);
        if(dist < min){ min = dist; closest = i; }
      });
      if(closest !== idx){ idx = closest; updateDots(); }
    });
  });

  // autoplay
  function play(){
    if(paused || timer) return;
    timer = setInterval(()=> go(1), 4000);
  }
  function stop(){ if(timer){ clearInterval(timer); timer=null; } }
  function restart(){ stop(); play(); }

  // etkileşimde durdur
  ['pointerenter','focusin','keydown','pointerdown'].forEach(ev=>{
    track.addEventListener(ev, ()=>{ paused=true; stop(); }, {passive:true});
  });
  ['pointerleave','focusout','keyup','pointerup'].forEach(ev=>{
    track.addEventListener(ev, ()=>{ paused=false; play(); }, {passive:true});
  });
  prev?.addEventListener('click', ()=>{ paused=true; stop(); go(-1); });
  next?.addEventListener('click', ()=>{ paused=true; stop(); go(1); });

  // sekme görünürlüğü
  document.addEventListener('visibilitychange', ()=>{
    if(document.hidden) stop(); else play();
  });

  // başlangıç
  updateDots(); play();
})();
/* ==== YP Başarılar slider – scoped ==== */
(() => {
  const track = document.getElementById('ypTrack');
  if(!track) return;
  const prev = document.querySelector('.yp-nav.prev');
  const next = document.querySelector('.yp-nav.next');

  const step = () => track.clientWidth * 0.9;
  const go = (d) => track.scrollBy({ left: d*step(), behavior:'smooth' });

  prev?.addEventListener('click', ()=>go(-1));
  next?.addEventListener('click', ()=>go(1));

  // sürükle-kaydır
  let down=false, sx=0, sl=0;
  track.addEventListener('pointerdown', e=>{down=true; sx=e.clientX; sl=track.scrollLeft; track.setPointerCapture(e.pointerId);});
  track.addEventListener('pointermove', e=>{ if(!down) return; track.scrollLeft = sl - (e.clientX - sx); });
  ['pointerup','pointerleave','pointercancel'].forEach(ev=>track.addEventListener(ev,()=>down=false));

  // dots + autoplay (soft)
  const dotsWrap = document.getElementById('ypDots');
  const cards = Array.from(track.querySelectorAll('.yp-card'));
  if(!dotsWrap) return;

  cards.forEach((_,i)=>{const b=document.createElement('button'); b.className='yp-dot'; b.type='button'; b.addEventListener('click',()=>goTo(i,true)); dotsWrap.appendChild(b);});
  const dots = Array.from(dotsWrap.children);
  let idx=0, t=null, paused=false;

  function update(){ dots.forEach((d,i)=>d.classList.toggle('active', i===idx)); }
  function goTo(i, smooth=false){
    idx=(i+cards.length)%cards.length;
    const x = cards[idx].offsetLeft - track.offsetLeft - 6;
    track.scrollTo({ left:x, behavior: smooth?'smooth':'auto' });
    update(); restart();
  }
  // aktif kartı scroll ile bul
  let raf;
  track.addEventListener('scroll', ()=>{
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>{
      let c=0,min=1e9,L=track.getBoundingClientRect().left;
      cards.forEach((el,i)=>{ const d=Math.abs(el.getBoundingClientRect().left-L); if(d<min){min=d;c=i;} });
      if(c!==idx){ idx=c; update(); }
    });
  });

  function play(){ if(paused||t) return; t=setInterval(()=>goTo(idx+1,true), 4000); }
  function stop(){ if(t){clearInterval(t); t=null;} }
  function restart(){ stop(); play(); }

  ['pointerenter','focusin','keydown','pointerdown'].forEach(ev=>track.addEventListener(ev,()=>{paused=true;stop();},{passive:true}));
  ['pointerleave','focusout','keyup','pointerup'].forEach(ev=>track.addEventListener(ev,()=>{paused=false;play();},{passive:true}));
  document.addEventListener('visibilitychange', ()=>{ if(document.hidden) stop(); else play(); });

  update(); play();
})();
