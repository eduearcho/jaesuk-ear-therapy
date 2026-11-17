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

  // 공통: 섹션으로 부드럽게 이동 (등장 애니메이션 전 위치가 아닌 원래 위치로 계산)
  const scrollToSection = (hash) => {
    const target = document.querySelector(hash);
    if (!target) return;
    let top = 0;
    for (let el = target; el; el = el.offsetParent) top += el.offsetTop;
    window.scrollTo({ top: top - header.offsetHeight - 16, behavior: reduceMotion ? 'auto' : 'smooth' });
    history.replaceState(null, '', hash);
  };

  // 7. 플로팅 안내원: 아바타를 누르면 말풍선 메뉴 열기·닫기
  const guideBtn = document.querySelector('.guide-avatar');
  const guidePopup = document.getElementById('guide-popup');
  const setGuide = (open) => {
    guidePopup.hidden = !open;
    guideBtn.setAttribute('aria-expanded', String(open));
    guideBtn.setAttribute('aria-label', open ? '안내 메뉴 닫기' : '안내 메뉴 열기');
    if (open) guidePopup.querySelector('a').focus({ preventScroll: true });
  };
  guideBtn.addEventListener('click', () => setGuide(guidePopup.hidden));
  guidePopup.querySelector('.guide-close').addEventListener('click', () => {
    setGuide(false);
    guideBtn.focus();
  });
  // 메뉴를 누르면 해당 섹션으로 부드럽게 이동 후 닫기
  guidePopup.querySelectorAll('.guide-menu a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToSection(link.getAttribute('href'));
      setGuide(false);
    });
  });
  // 바깥을 누르거나 Esc를 누르면 닫기
  document.addEventListener('click', (e) => {
    if (!guidePopup.hidden && !e.target.closest('.guide')) setGuide(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !guidePopup.hidden) { setGuide(false); guideBtn.focus(); }
  });

  // 활동 사진은 한 장씩 나타나게 (목록 전체가 길어도 문제없도록)
  document.querySelectorAll('.gallery-grid li').forEach((li) => li.classList.add('reveal'));

  // 8. 자세히 보기: data-detail 이 붙은 버튼을 누르면 같은 이름의 template 내용을 설명 창에 띄우기
  const dialog = document.getElementById('detail-dialog');
  const dialogBody = dialog.querySelector('.detail-body');
  document.querySelectorAll('[data-detail]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tpl = document.getElementById(btn.dataset.detail);
      if (!tpl) return;
      dialogBody.replaceChildren(tpl.content.cloneNode(true));
      const title = dialogBody.querySelector('h3');
      if (title) {
        title.id = 'detail-title';
        dialog.setAttribute('aria-labelledby', 'detail-title');
      }
      setGuide(false);
      dialog.classList.remove('is-photo');
      dialog.showModal();
      dialog.scrollTop = 0;
    });
  });

  // 활동 사진: 카테고리 버튼으로 골라 보기
  const filterBtns = document.querySelectorAll('.gallery-filters button');
  const galleryItems = document.querySelectorAll('.gallery-grid li');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.filter;
      filterBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      galleryItems.forEach((li) => { li.hidden = cat !== 'all' && li.dataset.cat !== cat; });
    });
  });

  // 활동 사진: 누르면 설명 창에 크게 보여 주기
  document.querySelectorAll('.gallery-item').forEach((item) => {
    item.addEventListener('click', () => {
      const figure = document.createElement('figure');
      figure.className = 'detail-photo';
      const img = document.createElement('img');
      img.src = item.dataset.full;
      img.alt = item.querySelector('img').alt;
      const caption = document.createElement('figcaption');
      caption.id = 'detail-title';
      caption.textContent = item.dataset.caption;
      figure.append(img, caption);
      dialogBody.replaceChildren(figure);
      dialog.setAttribute('aria-labelledby', 'detail-title');
      dialog.classList.add('is-photo');
      setGuide(false);
      dialog.showModal();
    });
  });
  dialog.querySelector('.detail-close').addEventListener('click', () => dialog.close());
  // 창 바깥(어두운 부분)을 누르면 닫기
  dialog.addEventListener('click', (e) => {
    const r = dialog.getBoundingClientRect();
    const outside = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    if (e.target === dialog && outside) dialog.close();
  });
  // 창 안의 "#섹션" 버튼은 창을 닫고 그 섹션으로 이동
  dialogBody.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    e.preventDefault();
    dialog.close();
    scrollToSection(link.getAttribute('href'));
  });

  // 9. 스크롤하면 서서히 나타나기
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
  document.querySelectorAll('.stats, .cards, .contact-buttons, .career-grid').forEach((group) => {
    group.querySelectorAll('.reveal').forEach((el, idx) => { el.style.transitionDelay = `${idx * 0.1}s`; });
  });
  revealItems.forEach((el) => observer.observe(el));
});
