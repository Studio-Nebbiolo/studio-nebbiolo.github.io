(() => {
  const messages = {
    ko: {
      made: '만든 것들', about: '소개', spinPinwheel: '바람개비에 바람 보내기', pinwheelSpun: '바람을 보내 바람개비를 돌렸어요.', homeLink: 'nebbiolo 만든 것들', navigation: '주 메뉴',
      aboutFirst: '세상에', aboutMiddle: '행복을', aboutLast: '뿌리기 위해.',
      backTop: '처음으로', close: '닫기',
      contactHeading: '문의', contactEmail: 'inquiry@nebbiolo.studio로 이메일 보내기',
      copyEmail: '복사', copyEmailLabel: '이메일 주소 복사', emailCopied: '복사됨',
      emailSelected: '주소 선택됨', emailCopiedStatus: '이메일 주소를 복사했어요.',
      emailSelectedStatus: '이메일 주소를 선택했어요. 복사해서 사용해 주세요.',
      lightTheme: '밝은 테마로 전환', darkTheme: '어두운 테마로 전환',
      bbokgongName: '뽁뽁이 공장', bbokgongOpen: '뽁뽁이 공장 자세히 보기', bbokgongImage: '입체적인 뽁뽁이 시트',
      bbokgongDescription: '손끝으로 뽁뽁이를 터뜨리며 잠깐 쉬어가는 작은 놀이터.',
      openAction: '열기',
      murimName: '무림 문파 감별록', murimOpen: '무림 문파 감별록 자세히 보기', murimImage: '무림 문파 감별록의 문파 상징 아이콘 29개',
      murimDescription: '당신이 강호에 산다면, 어느 문파일까요? 질문에 답하고 29개 문파 중 나와 닮은 곳을 찾아보세요.',
      murimAction: '감별하기',
      dashdashjumpdashName: 'DashDashJumpDash', dashdashjumpdashOpen: 'DashDashJumpDash 자세히 보기', dashdashjumpdashImage: '별이 뜬 새벽 능선 로비에서 공중으로 대시하는 캐릭터',
      dashdashjumpdashDescription: '대시와 점프로 오르는 픽셀 플랫포머. 맵마다 세계 랭킹이 있고, 상위 기록의 고스트가 함께 달려요.',
      playAction: '플레이하기',
      onepieceName: '원피스 캐릭터 감별소', onepieceOpen: '원피스 캐릭터 감별소 자세히 보기', onepieceImage: '낡은 종이 수배서 위에 쓰인 원피스 캐릭터 감별소 제목',
      onepieceDescription: '질문에 답하면 원피스 캐릭터 52명 중 나와 닮은 캐릭터와 나의 현상금을 알려줘요. 친구들과 해적단도 꾸려 보세요. 원피스 팬이 만든 비공식 테스트예요.',
      description: '세상에 행복을 뿌리기 위해.'
    },
    en: {
      made: 'Our work', about: 'About', spinPinwheel: 'Send a breeze to the pinwheel', pinwheelSpun: 'A little breeze is spinning the pinwheel.', homeLink: 'nebbiolo work', navigation: 'Main navigation',
      aboutFirst: 'To spread', aboutMiddle: 'happiness', aboutLast: 'into the world.',
      backTop: 'Back to top', close: 'Close',
      contactHeading: 'Contact', contactEmail: 'Email inquiry@nebbiolo.studio',
      copyEmail: 'Copy', copyEmailLabel: 'Copy email address', emailCopied: 'Copied',
      emailSelected: 'Selected', emailCopiedStatus: 'Email address copied.',
      emailSelectedStatus: 'Email address selected. Copy it to use it.',
      lightTheme: 'Switch to light mode', darkTheme: 'Switch to dark mode',
      bbokgongName: 'Bubble Wrap Factory', bbokgongOpen: 'About Bubble Wrap Factory', bbokgongImage: 'A three-dimensional sheet of bubble wrap',
      bbokgongDescription: 'A little playground for popping bubble wrap and taking a moment for yourself.',
      openAction: 'Open',
      murimName: 'Find Your Murim Sect', murimOpen: 'About Find Your Murim Sect', murimImage: 'The 29 sect emblems from Find Your Murim Sect',
      murimDescription: 'If you lived in the world of martial arts, where would you belong? Answer a few questions to find your match among 29 sects.',
      murimAction: 'Find your sect',
      dashdashjumpdashName: 'DashDashJumpDash', dashdashjumpdashOpen: 'About DashDashJumpDash', dashdashjumpdashImage: 'A character dashing through the air above a starry dawn ridge',
      dashdashjumpdashDescription: 'A pixel platformer where you climb with dashes and jumps. Every map has a world ranking, and ghosts of the top runs race alongside you.',
      playAction: 'Play',
      onepieceName: 'Which One Piece Character Are You?', onepieceOpen: 'About Which One Piece Character Are You?', onepieceImage: 'The title written on an old paper wanted poster',
      onepieceDescription: 'Answer a few questions to find which of 52 One Piece characters is most like you, along with your bounty. Then form a pirate crew with your friends. An unofficial test made by One Piece fans.',
      description: 'To spread happiness into the world.'
    }
  };
  let language = document.documentElement.lang;
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
