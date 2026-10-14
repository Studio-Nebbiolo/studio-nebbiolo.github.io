(() => {
  const messages = {
    ko: {
      made: '만든 것들', about: '소개', homeLink: 'Nebbiolo 만든 것들', navigation: '주 메뉴',
      aboutFirst: '세상에', aboutMiddle: '행복을', aboutLast: '뿌리기 위해.',
      backTop: '처음으로', close: '닫기',
      lightTheme: '밝은 테마로 전환', darkTheme: '어두운 테마로 전환',
      bbokgongName: '뽁뽁이공장', bbokgongOpen: '뽁뽁이공장 자세히 보기', bbokgongImage: '입체적인 뽁뽁이 시트',
      bbokgongDescription: '누르고, 당기고, 톡. 손끝으로 뽁뽁이를 터뜨리며 잠깐 쉬어가는 작은 놀이터입니다.',
      bbokgongSource: '뽁뽁이공장 GitHub 리포지토리', openAction: '열기',
      murimName: '무림 문파 감별록', murimOpen: '무림 문파 감별록 자세히 보기', murimImage: '무림 문파 감별록의 화산파 산수 풍경',
      murimDescription: '당신이 강호에 산다면, 어느 문파일까요? 질문에 답하고 29개 문파 중 나와 닮은 곳을 찾아보세요.',
      murimSource: '무림 문파 감별록 GitHub 리포지토리', murimAction: '감별하기',
      description: '작은 호기심으로 새로운 플레이를 만드는 독립 프로덕트 스튜디오, Nebbiolo.'
    },
    en: {
      made: 'Our work', about: 'About', homeLink: 'Nebbiolo work', navigation: 'Main navigation',
      aboutFirst: 'To spread', aboutMiddle: 'happiness', aboutLast: 'into the world.',
      backTop: 'Back to top', close: 'Close',
      lightTheme: 'Switch to light mode', darkTheme: 'Switch to dark mode',
      bbokgongName: 'Bubble Wrap Factory', bbokgongOpen: 'About Bubble Wrap Factory', bbokgongImage: 'A three-dimensional sheet of bubble wrap',
      bbokgongDescription: 'Press, pull, pop. A little playground for popping bubble wrap and taking a moment for yourself.',
      bbokgongSource: 'Bubble Wrap Factory GitHub repository', openAction: 'Open',
      murimName: 'Find Your Murim Sect', murimOpen: 'About Find Your Murim Sect', murimImage: 'The Mount Hua landscape from Find Your Murim Sect',
      murimDescription: 'If you lived in the world of martial arts, where would you belong? Answer a few questions to find your match among 29 sects.',
      murimSource: 'Find Your Murim Sect GitHub repository', murimAction: 'Find your sect',
      description: 'Nebbiolo is an independent studio turning little curiosities into playful experiences.'
    }
  };
  let language = 'ko';
  try { if (localStorage.getItem('nebbiolo-language') === 'en') language = 'en'; } catch (_) {}
  const button = document.querySelector('.language-toggle');
  const t = key => messages[language][key];
  const translate = container => {
    for (const [attribute, target] of [['data-i18n', null], ['data-i18n-aria', 'aria-label'], ['data-i18n-alt', 'alt']]) {
      container.querySelectorAll(`[${attribute}]`).forEach(element => {
        const value = t(element.getAttribute(attribute));
        if (value === undefined) return;
        if (target) element.setAttribute(target, value);
        else element.textContent = value;
      });
    }
  };
  const apply = () => {
    document.documentElement.lang = language;
    translate(document);
    document.querySelectorAll('template').forEach(template => translate(template.content));
    document.querySelector('meta[name="description"]').content = t('description');
    button.textContent = language === 'ko' ? 'EN' : 'KO';
    button.lang = language === 'ko' ? 'en' : 'ko';
    button.setAttribute('aria-label', language === 'ko' ? 'Switch to English' : '한국어로 전환');
    document.dispatchEvent(new Event('nebbiolo:languagechange'));
  };
  window.NebbioloI18n = { t, translate, get language() { return language; } };
  button.addEventListener('click', () => {
    language = language === 'ko' ? 'en' : 'ko';
    try { localStorage.setItem('nebbiolo-language', language); } catch (_) {}
    apply();
  });
  apply();
})();
