// 조재숙의 이혈테라피 — 페이지 동작 (외부 라이브러리 없음)
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. 햄버거 메뉴 (휴대폰)
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    nav.classList.toggle('is-open', open);
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // 2. 스크롤하면 메뉴 아래 그림자
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // 3. 이메일: 스팸 수집을 줄이려고 화면에서 조합
  const emailLink = document.querySelector('.js-email');
  if (emailLink) {
    const address = `${emailLink.dataset.user}@${emailLink.dataset.domain}`;
    emailLink.href = `mailto:${address}`;
    document.querySelectorAll('.js-email-text').forEach((el) => { el.textContent = address; });
  }

  // 4. 저작권 연도 자동
  document.querySelectorAll('.js-year').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // 5. 글자 타이핑 효과
  const typing = document.querySelector('.typing');
  if (typing && !reduceMotion) {
    const text = typing.dataset.text;
    typing.setAttribute('aria-label', text);
    typing.textContent = '';
    typing.classList.add('is-typing');
    let i = 0;
    const type = () => {
      typing.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(type, 70);
      else setTimeout(() => typing.classList.remove('is-typing'), 1600);
    };
    setTimeout(type, 400);
  }

  // 6. 숫자 올라가기
  const countUp = (el) => {
    const target = Number(el.dataset.target);
    const duration = 800;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) requestAnimationFrame(step);
    };
    el.textContent = '0';
    requestAnimationFrame(step);
  };

  // 7. 스크롤하면 서서히 나타나기
  const revealItems = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('is-visible');
      el.querySelectorAll('.count').forEach(countUp);
      setTimeout(() => { el.style.transitionDelay = ''; }, 1200);
      observer.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  // 같은 줄의 카드는 살짝씩 시간차를 두고 등장
  document.querySelectorAll('.stats, .cards, .gallery, .contact-buttons, .career-grid').forEach((group) => {
    group.querySelectorAll('.reveal').forEach((el, idx) => { el.style.transitionDelay = `${idx * 0.1}s`; });
  });
  revealItems.forEach((el) => observer.observe(el));
});
