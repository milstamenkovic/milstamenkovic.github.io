document.addEventListener('DOMContentLoaded',()=>{
  const body=document.body;
  const themeToggle=document.getElementById('theme-toggle');
  const modal=document.getElementById('modal');
  const modalBody=document.getElementById('modal-body');
  const modalClose=document.getElementById('modal-close');
  const filters=document.querySelectorAll('.filter');
  const cards=document.querySelectorAll('#works-grid .card');
  const progress=document.getElementById('top-progress');

  // Restore theme
  const theme=localStorage.getItem('author_v2_theme');
  if(theme==='light') body.classList.add('light');
  themeToggle.addEventListener('click',()=>{
    const isLight=body.classList.toggle('light');
    themeToggle.setAttribute('aria-pressed',String(isLight));
    localStorage.setItem('author_v2_theme', isLight? 'light':'dark');
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
  function openSample(title,excerpt){
    modalBody.innerHTML=`<h3>${title}</h3><p>${excerpt}</p><p class="muted">Ово је прегледни узорак за демонстрацију.</p>`;
    modal.setAttribute('aria-hidden','false');
  }
  document.querySelectorAll('.view-sample').forEach((b)=>{
    b.addEventListener('click',()=>{
      const card=b.closest('.card');
      openSample(card.querySelector('h3').textContent, card.querySelector('.excerpt').textContent);
    });
  });
  modalClose.addEventListener('click',()=>modal.setAttribute('aria-hidden','true'));
  modal.addEventListener('click',e=>{ if(e.target===modal) modal.setAttribute('aria-hidden','true') });

  // Timeline nav (simple scroll)
  const tlView=document.querySelector('.tl-view');
  document.getElementById('tl-next').addEventListener('click',()=>{ tlView.scrollBy({left:280,behavior:'smooth'}) });
  document.getElementById('tl-prev').addEventListener('click',()=>{ tlView.scrollBy({left:-280,behavior:'smooth'}) });

  // Newsletter demo (Serbian)
  document.getElementById('newsletter-form').addEventListener('submit',e=>{
    e.preventDefault();
    const email=e.target.email.value.trim();
    if(!email || !email.includes('@')){ alert('Унесите важећу е-пошту.'); return }
    alert('Хвала, пријављени сте (демо).');
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
    openSample('Одломак — Сенка реке','Гледао је реку како носи своје делове. За тренутак сећање га је поново прозвало.');
  });

  // Video widget close toggle
  const videoWidget=document.querySelector('.video-widget');
  const videoToggle=document.getElementById('video-toggle');
  if(videoToggle && videoWidget){
    videoToggle.addEventListener('click',()=>{
      const hidden = videoWidget.getAttribute('aria-hidden') === 'true';
      if(hidden){
        videoWidget.setAttribute('aria-hidden','false');
        videoToggle.setAttribute('aria-pressed','false');
        videoWidget.style.display='flex';
      } else {
        videoWidget.setAttribute('aria-hidden','true');
        videoToggle.setAttribute('aria-pressed','true');
        videoWidget.style.display='none';
      }
    });
  }
  
  // Click-to-play thumbnail: injects YouTube iframe on user gesture (allows unmuted autoplay)
  const thumb = document.querySelector('.video-thumb');
  if(thumb && videoWidget){
    const videoId = videoWidget.dataset.videoId;
    // Use YouTube IFrame API so we can catch embedding errors (codes like 150/101/153)
    function loadYouTubeAPI(){
      return new Promise((resolve,reject)=>{
        if(window.YT && YT.Player) return resolve();
        if(document.getElementById('yt-api')){
          // someone else is loading it
          window.onYouTubeIframeAPIReady = () => resolve();
          return;
        }
        window.onYouTubeIframeAPIReady = () => resolve();
        const s = document.createElement('script');
        s.id = 'yt-api';
        s.src = 'https://www.youtube.com/iframe_api';
        s.async = true;
        s.onerror = ()=> reject(new Error('YT API failed to load'));
        document.head.appendChild(s);
      });
    }

    function fallbackToYouTubeLink(container, id){
      const linkWrap = document.createElement('div');
      linkWrap.className = 'video-error-overlay';
      linkWrap.innerHTML = `<p>Уграђивање видео записа није доступно. Отворите видео на YouTube-у:</p><p><a href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener">Отвори на YouTube</a></p>`;
      container.innerHTML='';
      container.appendChild(linkWrap);
    }

    function playFromThumb(){
      // replace thumb with a div target then load YT player
      const target = document.createElement('div');
      target.style.width='100%'; target.style.height='100%';
      const playerId = 'yt-player-' + Math.random().toString(36).slice(2,9);
      target.id = playerId;
      thumb.replaceWith(target);

      loadYouTubeAPI().then(()=>{
        try{
          new YT.Player(playerId,{
            videoId: videoId,
            playerVars: {autoplay:1,rel:0,modestbranding:1,playsinline:1},
            events: {
              onReady: (e)=>{ try{ e.target.playVideo(); }catch(_){}}
              ,onError: (ev)=>{
                // show fallback UI
                fallbackToYouTubeLink(target, videoId);
              }
            }
          });
        }catch(err){
          fallbackToYouTubeLink(target, videoId);
        }
      }).catch(()=>{
        fallbackToYouTubeLink(target, videoId);
      });
    }
    thumb.addEventListener('click', playFromThumb);
    thumb.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); playFromThumb(); } });
  }
});
