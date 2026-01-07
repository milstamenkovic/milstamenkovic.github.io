document.addEventListener('DOMContentLoaded',()=>{
  const body=document.body;
  const themeToggle=document.getElementById('theme-toggle');
  const modal=document.getElementById('modal');
  const modalBody=document.getElementById('modal-body');
  const modalClose=document.getElementById('modal-close');
  const filters=document.querySelectorAll('.filter');
  const cards=document.querySelectorAll('#works-grid .card');
  const progress=document.getElementById('top-progress');

  // Theme
  const theme=localStorage.getItem('theme');
  if(theme==='light') body.classList.add('light');
  themeToggle.addEventListener('click',()=>{
    const isLight=body.classList.toggle('light');
    themeToggle.setAttribute('aria-pressed',String(isLight));
    localStorage.setItem('theme', isLight? 'light':'dark');
  });

  // Filters
  filters.forEach(btn=>btn.addEventListener('click',()=>{
    filters.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const f=btn.dataset.filter;
    cards.forEach(c=>{
      c.style.display=(f==='all' || c.dataset.type===f)? 'block':'none';
    });
  }));

  // Modal samples
  document.querySelectorAll('.view-sample').forEach((b,i)=>{
    b.addEventListener('click',()=>{
      const card=b.closest('.card');
      const title=card.querySelector('h3').textContent;
      const excerpt=card.querySelector('.excerpt').textContent;
      modalBody.innerHTML=`<h3>${title}</h3><p>${excerpt}</p><p class="muted">This is a preview sample for demonstration purposes.</p>`;
      modal.setAttribute('aria-hidden','false');
    });
  });
  modalClose.addEventListener('click',()=>modal.setAttribute('aria-hidden','true'));
  modal.addEventListener('click',e=>{ if(e.target===modal) modal.setAttribute('aria-hidden','true') });

  // Timeline nav (simple scroll)
  const tlView=document.querySelector('.tl-view');
  document.getElementById('tl-next').addEventListener('click',()=>{ tlView.scrollBy({left:220,behavior:'smooth'}) });
  document.getElementById('tl-prev').addEventListener('click',()=>{ tlView.scrollBy({left:-220,behavior:'smooth'}) });

  // Newsletter demo
  document.getElementById('newsletter-form').addEventListener('submit',e=>{
    e.preventDefault();
    const email=e.target.email.value.trim();
    if(!email || !email.includes('@')){ alert('Унесите важећу е-пошту.'); return }
    alert('Хвала — ово је демонстрациони формулар.');
    e.target.reset();
  });

  // Reading progress
  function updateProgress(){
    const h=document.documentElement;
    const total=h.scrollHeight - h.clientHeight;
    const pct= total? (window.scrollY/total)*100:0;
    progress.style.width = pct + '%';
  }
  updateProgress();
  window.addEventListener('scroll',updateProgress);

  // Open main excerpt from hero
  document.getElementById('open-excerpt').addEventListener('click',()=>{
    modalBody.innerHTML=`<h3>Одломак — Сенка реке</h3><p>Гледао је како река носи своје делове, а његова сенка међу њима. На тренутак је ток сетио њега назад.</p>`;
    modal.setAttribute('aria-hidden','false');
  });

  // Update sample modal text language
  document.querySelectorAll('.view-sample').forEach((b)=>{
    b.addEventListener('click',()=>{
      const card=b.closest('.card');
      const title=card.querySelector('h3').textContent;
      const excerpt=card.querySelector('.excerpt').textContent;
      modalBody.innerHTML=`<h3>${title}</h3><p>${excerpt}</p><p class="muted">Ово је прегледни узорак за демонстрацију.</p>`;
      modal.setAttribute('aria-hidden','false');
    });
  });
});
