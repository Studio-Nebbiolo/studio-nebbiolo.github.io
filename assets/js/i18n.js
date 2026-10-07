// 한국어가 기본. HTML 에 적힌 한국어가 원본이고, 여기엔 영어 번역과
// 스크립트에서만 쓰는 문구(마스코트 대사 등)를 둔다.
(function (root) {
  const JS_KO = {
    'bowl.strike': 'STRIKE!',
    'bowl.spare': '{n}개!',
    'bowl.gutter': '거터… 😢',
    'farm.q': ['일반', '희귀', '고급', '전설', '신화'],
    'walk.summon': '이 페이지에 친구들 불러내기',
    'walk.dismiss': '친구들 집에 보내기',
    'team': [
      { name: '포도 1호', role: '정체: ???', say: '아직은 비밀이야 🤫' },
      { name: '포도 2호', role: '정체: ???', say: '곧 자기소개 할게!' },
      { name: '포도 3호', role: '정체: ???', say: '나 찾았어? 🍇' },
    ],
    'mine.ore': '광물 +1!',
  };

  const EN = {
    'nav.games': 'Games',
    'nav.about': 'About',
    'nav.lab': 'Lab',
    'nav.contact': 'Contact',
    'hero.eyebrow': 'Indie game studio',
    'hero.lead': 'Like grapes ripening slowly in the fog,<br>we craft games you’ll want to keep close.',
    'hero.cta1': 'See our games',
    'hero.cta2': 'Who we are',
    'hero.hint': 'Click anywhere empty to drop grapes. Drag to throw them!',
    'games.title': 'Games we made',
    'games.sub': 'Every card hides a little toy. Poke it, drag it, play with it!',
    'stat.games': 'games made',
    'stat.crops': 'Farm Idler crops',
    'stat.boss': 'Kingpin boss patterns',
    'stat.colors': 'Big Walk friend colors',
    'ss.tag': 'The operators are pins. The bullets are bowling balls.',
    'ss.desc': 'A 5v5 tactical shooter rebuilt around bowling. Roll balls across the floor to knock down the whole enemy team, or plant and defuse the bomb to take the round. Banking shots off walls is half the fun.',
    'ss.f1': 'Round-based bomb plant & defuse with a shop and economy',
    'ss.f2': 'Jump straight into a match against easy, normal, or hard bots',
    'ss.f3': '1–4 player PvE raid against the Kingpin and his six attack patterns',
    'ss.dl': 'Download for Windows',
    'ss.web': 'Web version (needs a server)',
    'ss.toy': 'Mini bowling — pull the ball back and let go',
    'play.now': 'Play now',
    'fi.tag': 'A tiny farm that grows at the bottom of your screen.',
    'fi.desc': 'An idle farm you park along the bottom of your desktop. Till with a hoe, plant seeds, water them, and your crops grow over 20–60 minutes. Whatever grew while you were away is waiting when you come back.',
    'fi.f1': 'A tech tree of 11 crops, from carrots to pumpkins',
    'fi.f2': 'Crop quality from Common to Mythic, depending on fertilizer',
    'fi.f3': 'Upgrade your hoe, watering can, and seed bag, and decorate',
    'fi.play': '▶ Play in your browser',
    'fi.dl': 'Windows build',
    'fi.toy': 'Mini garden — till → plant → water → harvest!',
    'bw.fan': 'Unofficial fan project',
    'bw.tag': 'Round little friends strolling on your taskbar.',
    'bw.desc': 'Desktop buddies who walk, rest, sit, and wave at each other along the bottom of your screen. Click one and it hops; throw one and it lands on its bum, seeing stars. Sometimes walkie-talkies, megaphones, radios, and flare guns drop in for them to play with.',
    'bw.f1': 'Pick head, body, and leg colors from 21 shades, then share them as a code',
    'bw.f2': 'Click the red daruma 20 times to collect it',
    'bw.f3': '11 languages, including Korean, English, and Japanese',
    'bw.summon': 'Bring the friends onto this page',
    'bw.credit': 'An unofficial fan project inspired by the characters of <i>Big Walk</i> by House House.',
    'bw.add': '+ Friend',
    'bw.daruma': 'Daruma',
    'bw.home': 'Send home',
    'games.more': 'And there’s more',
    'mi.state': 'Test build',
    'mi.desc': 'An idle game where you hire miners to dig out a mine. Haul the ore by cart, get it appraised, then sell it or put it up for auction. Every key you type swings a pickaxe too. Click the mine above to dig yourself. 10 swings gets you an ore!',
    'mi.dl': 'Windows (zip)',
    'cb.state': 'Coming soon',
    'cb.tag': 'Out-think them on the board. Finish it with your fists.',
    'cb.desc': 'A real-time 1v1 web game that alternates chess rounds and boxing rounds, following World Chess Boxing Organisation rules. There’s a challenge mode from the round of 16 to the final, Stockfish chess practice, and match reviews. Tap the screen to switch rounds!',
    'about.title': 'Who are we?',
    'about.story1': '<b>Nebbiolo</b> is a grape grown in Piedmont, Italy. The name comes from <b>“nebbia,”</b> meaning fog, because it ripens slowly in late autumn as fog settles over the hills.',
    'about.story2': 'Studio Nebbiolo makes games the same way. We start small, ship often, and let them ripen alongside our players. From a buddy that lives in the corner of your work screen to a rowdy versus game with friends, we’re chasing <b>fun you’ll want to keep close</b>.',
    'v.hint': 'Flip me ↻',
    'v1.t': 'Small & often',
    'v1.d': 'We build small games fast and experiment a lot. The fun ones grow up; the others we let go without regrets.',
    'v2.t': 'Cute, but serious',
    'v2.d': 'Round and squishy on the outside, solid game feel on the inside. We think hard about physics and angles even for a single bowling ball.',
    'v3.t': 'Ripen slowly',
    'v3.d': 'Like grapes in the fog, our games mature little by little as we listen to players.',
    'team.title': 'The grape bunch',
    'team.sub': 'Identities are still secret. Pet them and they might say something?',
    'lab.title': 'Grape bubble-wrap lab',
    'lab.sub': 'Stressed? Pop some grapes. You can hold and swipe, too.',
    'lab.count': 'Grapes popped',
    'lab.refill': '↻ New grapes',
    'contact.title': 'Let’s play!',
    'contact.sub': 'Talk to us about games, bugs, or making something together.',
    'footer.made': 'handmade in the fog',
    'footer.secret': 'Try typing n · e · b · b · i on your keyboard',
    'play.full': 'Fullscreen',
    'play.tab': '↗ New tab',
    'bowl.strike': 'STRIKE!',
    'bowl.spare': '{n} pins!',
    'bowl.gutter': 'Gutter… 😢',
    'farm.q': ['Common', 'Rare', 'Fine', 'Legendary', 'Mythic'],
    'walk.summon': 'Bring the friends onto this page',
    'walk.dismiss': 'Send the friends home',
    'team': [
      { name: 'Grape #1', role: 'Identity: ???', say: 'Still a secret 🤫' },
      { name: 'Grape #2', role: 'Identity: ???', say: 'Intro coming soon!' },
      { name: 'Grape #3', role: 'Identity: ???', say: 'You found me? 🍇' },
    ],
    'mine.ore': 'Ore +1!',
  };

  const originals = new Map();
  let lang = 'ko';
  try { lang = localStorage.getItem('nb.lang') || 'ko'; } catch (e) {}
  if (lang !== 'en') lang = 'ko';

  const listeners = [];

  const I18n = {
    get lang() { return lang; },
    t(key, vars) {
      let v = (lang === 'en' ? EN[key] : undefined) ?? JS_KO[key] ?? key;
      if (typeof v === 'string' && vars) v = v.replace(/\{(\w+)\}/g, (_, k) => vars[k]);
      return v;
    },
    apply(next) {
      lang = next === 'en' ? 'en' : 'ko';
      try { localStorage.setItem('nb.lang', lang); } catch (e) {}
      document.documentElement.lang = lang;
      document.querySelectorAll('[data-i18n], [data-i18n-html]').forEach((el) => {
        const html = el.hasAttribute('data-i18n-html');
        const key = el.getAttribute(html ? 'data-i18n-html' : 'data-i18n');
        if (!originals.has(el)) originals.set(el, el.innerHTML);
        if (lang === 'en' && EN[key] != null) {
          if (html || /<\w/.test(EN[key])) el.innerHTML = EN[key];
          else el.textContent = EN[key];
        } else {
          el.innerHTML = originals.get(el);
        }
      });
      listeners.forEach((fn) => fn(lang));
    },
    onChange(fn) { listeners.push(fn); },
  };
  root.I18n = I18n;
})(window);
