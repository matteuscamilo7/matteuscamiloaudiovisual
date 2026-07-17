// LOADER
const loaderStart=Date.now();
window.addEventListener('load',()=>{
    const elapsed=Date.now()-loaderStart;
    const delay=Math.max(0,Math.min(800,2500-elapsed));
    setTimeout(()=>{document.getElementById('loader').classList.add('hidden')},delay);
});

// HAMBURGER
const hamburger=document.getElementById('hamburger');
const mobileOverlay=document.getElementById('mobileOverlay');
function toggleMenu(){hamburger.classList.toggle('active');mobileOverlay.classList.toggle('active');document.body.style.overflow=mobileOverlay.classList.contains('active')?'hidden':''}
hamburger.addEventListener('click',toggleMenu);
document.querySelectorAll('.mobile-link,.mobile-cta').forEach(l=>l.addEventListener('click',toggleMenu));

// UNIFIED SCROLL HANDLER (rAF throttled)
const navbar=document.getElementById('navbar');
const heroBgImg=document.querySelector('.hero-bg-img');
let scrollTicking=false;
window.addEventListener('scroll',()=>{
    if(!scrollTicking){
        requestAnimationFrame(()=>{
            const s=window.scrollY;
            navbar.classList.toggle('scrolled',s>60);
            if(heroBgImg&&s<window.innerHeight){heroBgImg.style.transform=`translateY(${s*0.35}px) scale(1.1)`}
            scrollTicking=false;
        });
        scrollTicking=true;
    }
},{passive:true});

// PAUSE SPARKLES OFF-SCREEN
(function(){
    const scene=document.querySelector('.scene-3d');
    if(!scene)return;
    const obs=new IntersectionObserver(entries=>{
        entries.forEach(e=>{
            scene.classList.toggle('paused',!e.isIntersecting);
        });
    },{threshold:0});
    obs.observe(document.querySelector('.hero')||scene);
})();

// LAZY LOAD YOUTUBE IFRAMES
(function(){
    const iframes=document.querySelectorAll('iframe[data-src]');
    if(!iframes.length)return;
    const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){const iframe=e.target;iframe.src=iframe.dataset.src;obs.unobserve(iframe)}})},{threshold:0.1,rootMargin:'200px'});
    iframes.forEach(f=>obs.observe(f));
})();

// YT CAROUSELS (Transform-Based Navigation)
document.querySelectorAll('.yt-carousel').forEach(carousel=>{
    const track=carousel.querySelector('.yt-track');
    const prevBtn=carousel.querySelector('.yt-prev');
    const nextBtn=carousel.querySelector('.yt-next');
    if(!track||!prevBtn||!nextBtn)return;
    const cards=Array.from(track.children);
    if(!cards.length)return;
    let idx=0;
    function getVisible(){const w=track.parentElement.offsetWidth;const c=cards[0];if(!c)return 1;const gap=track.classList.contains('yt-track-reels')?12:16;return Math.max(1,Math.floor((w+gap)/(c.offsetWidth+gap)))}
    function update(){
        const gap=track.classList.contains('yt-track-reels')?12:16;
        const cardW=cards[0].offsetWidth+gap;
        const maxIdx=Math.max(0,cards.length-getVisible());
        idx=Math.min(idx,maxIdx);
        track.style.transform=`translateX(-${idx*cardW}px)`;
        prevBtn.classList.toggle('hidden',idx===0);
        nextBtn.classList.toggle('hidden',idx>=maxIdx);
    }
    prevBtn.addEventListener('click',()=>{if(idx>0){idx--;update()}});
    nextBtn.addEventListener('click',()=>{const maxIdx=Math.max(0,cards.length-getVisible());if(idx<maxIdx){idx++;update()}});
    update();
    let rt;window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(update,150)});
});

// DEPOIMENTOS AUTO CAROUSEL
(function(){
    const track=document.querySelector('.depo-track');
    const slides=document.querySelectorAll('.depo-slide');
    const dotsContainer=document.getElementById('depoDots');
    if(!track||!slides.length||!dotsContainer)return;
    let current=0;
    const total=slides.length;

    slides.forEach((_,i)=>{
        const dot=document.createElement('button');
        dot.className='depo-dot'+(i===0?' active':'');
        dot.setAttribute('aria-label',`Depoimento ${i+1}`);
        dot.addEventListener('click',()=>{current=i;goTo(current);resetTimer()});
        dotsContainer.appendChild(dot);
    });

    function goTo(idx){
        track.style.transform=`translateX(-${idx*100}%)`;
        document.querySelectorAll('.depo-dot').forEach((d,i)=>d.classList.toggle('active',i===idx));
    }

    let timer=setInterval(()=>{current=(current+1)%total;goTo(current)},4000);
    function resetTimer(){clearInterval(timer);timer=setInterval(()=>{current=(current+1)%total;goTo(current)},4000)}
    const carouselEl=document.querySelector('.depo-carousel');
    if(carouselEl){carouselEl.addEventListener('mouseenter',()=>clearInterval(timer));carouselEl.addEventListener('mouseleave',()=>{timer=setInterval(()=>{current=(current+1)%total;goTo(current)},4000)})}

    let sx=0,dr=false;
    track.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;dr=true},{passive:true});
    track.addEventListener('touchmove',e=>{if(!dr)return;const d=sx-e.touches[0].clientX;if(Math.abs(d)>40){if(d>0)current=(current+1)%total;else current=(current-1+total)%total;goTo(current);dr=false;resetTimer()}},{passive:true});
    track.addEventListener('touchend',()=>{dr=false});
    let mx=0,md=false;
    track.addEventListener('mousedown',e=>{mx=e.clientX;md=true;track.style.cursor='grabbing'});
    document.addEventListener('mouseup',e=>{if(!md)return;md=false;track.style.cursor='';const d=mx-e.clientX;if(Math.abs(d)>50){if(d>0)current=(current+1)%total;else current=(current-1+total)%total;goTo(current);resetTimer()}});
})();

// SLOT MACHINE COUNTERS
function animateCounters(){
    document.querySelectorAll('[data-count]').forEach(el=>{
        const target=parseInt(el.dataset.count);
        const numEl=el.closest('.stat-num');
        if(!numEl)return;
        numEl.innerHTML='<span class="stat-num-inner"><span class="stat-num-roll" style="display:inline-block">0</span></span><span class="stat-suffix">'+el.nextElementSibling.textContent+'</span>';
        const roll=numEl.querySelector('.stat-num-roll');
        let current=0;
        const duration=2000;
        const startTime=performance.now();
        function tick(now){
            const elapsed=now-startTime;
            const progress=Math.min(elapsed/duration,1);
            const eased=1-Math.pow(1-progress,3);
            current=Math.floor(eased*target);
            roll.textContent=current;
            if(progress<1)requestAnimationFrame(tick);
            else roll.textContent=target;
        }
        requestAnimationFrame(tick);
    });
}

// SCROLL REVEAL
function setupReveal(){
    const revealObserver=new IntersectionObserver(entries=>{
        entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');revealObserver.unobserve(e.target)}})
    },{threshold:.06,rootMargin:'0px 0px -30px 0px'});
    document.querySelectorAll('.section-head,.cta-footer-inner,.depo-layout').forEach(el=>{el.classList.add('reveal');revealObserver.observe(el)});
    document.querySelectorAll('.depo-video-side').forEach(el=>{el.classList.add('reveal-left');revealObserver.observe(el)});
    document.querySelectorAll('.depo-carousel-side').forEach(el=>{el.classList.add('reveal-right');revealObserver.observe(el)});
    document.querySelectorAll('.service-card').forEach((el,i)=>{
        el.classList.add('reveal-scale');
        el.style.transitionDelay=`${i*0.08}s`;
        revealObserver.observe(el);
    });
    document.querySelectorAll('.yt-carousel').forEach((el,i)=>{
        el.classList.add('reveal-scale');
        el.style.transitionDelay=`${i*0.08}s`;
        revealObserver.observe(el);
    });
    document.querySelectorAll('.yt-carousel-head').forEach((el,i)=>{
        el.classList.add('reveal');
        el.style.transitionDelay=`${i*0.1}s`;
        revealObserver.observe(el);
    });
}

// DEPOIMENTO MODAL
(function(){
    const modal=document.getElementById('depoModal');
    const modalImg=document.getElementById('depoModalImg');
    const modalClose=document.getElementById('depoModalClose');
    const modalOverlay=document.getElementById('depoModalOverlay');
    if(!modal||!modalImg)return;
    let lastFocused=null;
    document.querySelectorAll('.depo-slide').forEach(slide=>{
        slide.addEventListener('click',()=>{
            const src=slide.dataset.depo;
            if(src){lastFocused=document.activeElement;modalImg.src=src;modal.classList.add('active');document.body.style.overflow='hidden';modalClose.focus()}
        });
    });
    function closeModal(){modal.classList.remove('active');document.body.style.overflow='';modalImg.src='';if(lastFocused)lastFocused.focus()}
    modalClose.addEventListener('click',closeModal);
    modalOverlay.addEventListener('click',closeModal);
    modal.addEventListener('keydown',e=>{
        if(e.key==='Escape'){closeModal();return}
        if(e.key==='Tab'){
            const focusable=modal.querySelectorAll('button,img,[tabindex]');
            const first=focusable[0];const last=focusable[focusable.length-1];
            if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
            else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
        }
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('active'))closeModal()});
})();

// DARK/LIGHT MODE
(function(){
    const toggle=document.getElementById('themeToggle');
    if(!toggle)return;
    const saved=localStorage.getItem('mc-theme');
    if(saved==='light'){document.body.classList.add('light');toggle.setAttribute('aria-pressed','true')}
    toggle.addEventListener('click',()=>{
        document.body.classList.toggle('light');
        const isLight=document.body.classList.contains('light');
        localStorage.setItem('mc-theme',isLight?'light':'dark');
        toggle.setAttribute('aria-pressed',String(isLight));
    });
})();

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(a=>{a.addEventListener('click',e=>{const href=a.getAttribute('href');if(!href||href==='#')return;e.preventDefault();const t=document.querySelector(href);if(t)t.scrollIntoView({behavior:a.id==='skipLink'?'instant':'smooth',block:'start'})})});

// 3D TILT EFFECT
(function(){
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    document.querySelectorAll('.service-card,.yt-card').forEach(card=>{
        let ticking=false;
        card.addEventListener('mousemove',e=>{
            if(!ticking){
                requestAnimationFrame(()=>{
                    const r=card.getBoundingClientRect();
                    const x=e.clientX-r.left;
                    const y=e.clientY-r.top;
                    const cx=r.width/2;
                    const cy=r.height/2;
                    const rx=(y-cy)/cy*-6;
                    const ry=(x-cx)/cx*6;
                    card.style.transform=`perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`;
                    ticking=false;
                });
                ticking=true;
            }
        });
        card.addEventListener('mouseleave',()=>{
            card.style.transform='perspective(600px) rotateX(0) rotateY(0) scale(1)';
            card.style.transition='transform .5s cubic-bezier(.4,0,.2,1)';
        });
        card.addEventListener('mouseenter',()=>{card.style.transition='none'});
    });
})();

// INIT
document.addEventListener('DOMContentLoaded',()=>{
    setupReveal();
    const loader=document.getElementById('loader');
    if(loader&&loader.classList.contains('hidden')){animateCounters()}
    else{
        const obs=new MutationObserver(()=>{if(loader.classList.contains('hidden')){obs.disconnect();animateCounters()}});
        obs.observe(loader,{attributes:true,attributeFilter:['class']});
    }

    /* Back to top */
    const backToTop=document.getElementById('backToTop');
    if(backToTop){
        window.addEventListener('scroll',()=>{backToTop.classList.toggle('visible',window.scrollY>600)},{passive:true});
        backToTop.addEventListener('click',()=>{window.scrollTo({top:0,behavior:'smooth'})});
    }
});
