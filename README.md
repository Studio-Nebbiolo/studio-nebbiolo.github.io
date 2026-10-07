# Studio Nebbiolo 홈페이지

`https://studio-nebbiolo.github.io/` 에 올릴 스튜디오 소개 사이트예요. 빌드 도구 없이 정적 파일만으로 돌아가요.

## 미리 보기

```bash
cd homepage
python3 -m http.server 8000   # http://localhost:8000
```

`index.html` 을 더블클릭해서 열면 Farm Idler(WebAssembly)와 Big Walk 친구들(iframe 통신)이 동작하지 않으니 꼭 로컬 서버로 여세요.

## 구조

```
index.html              페이지 뼈대 (한국어 원문)
assets/css/style.css    색·글꼴 토큰은 맨 위 :root 에 (라이트), [data-theme="dark"] 에 (다크)
assets/js/theme.js      라이트/다크 전환 + 캔버스가 쓰는 3색 팔레트
assets/js/i18n.js       영어 번역, 팀원 카드 내용
assets/js/hero.js       히어로: 포도알 물리 (누르면 떨어지고 끌어서 던지기)
assets/js/toys.js       카드 장난감(볼링·텃밭·광산·체스복싱), 포도 뽁뽁이, 팀원 카드
assets/js/main.js       내비, 언어 전환, 스크롤 연출, 플레이 모달, Big Walk 친구들, 이스터에그
assets/js/sound.js      WebAudio 효과음 (파일 없음)
assets/img/games/       게임 이미지
play/farm-idler/        Farm-Idler-Build 저장소 web/Build 를 복사한 Unity WebGL 빌드
play/big-walk/          Big-Walk-Desktop-Companion 의 렌더러 코드(shared/*.js, companion.js) 복사본
```

## 색

메인 `#7B1E4B`(와인) · 포인트 `#E8B84A`(크림골드) · 베이스 `#FBF8F4` / `#141012`(라이트/다크) 세 가지만 써요.
글자·선·면은 이 셋을 섞은 농도(`--muted`, `--line`, `--surface` …)로 만들어요. 색을 바꾸려면 `style.css` 맨 위
`--main`, `--point`, `--base`, `--fg` 만 고치면 캔버스(포도알·볼링 등)까지 같이 바뀌어요.
게임 스크린샷, Big Walk 친구들, 텃밭 작물 이모지는 게임 자체의 색이라 그대로 둬요.

테마는 처음 방문 시 시스템 설정을 따르고, 내비의 해/달 버튼으로 바꾸면 그 선택을 기억해요.

## 자주 바꿀 것

- **팀원 소개**: `assets/js/i18n.js` 의 `'team'` 배열 (한국어 `JS_KO`, 영어 `EN` 두 군데). 4번째 사람부터는 모양이 처음부터 다시 돌아요.
- **게임 설명/링크**: `index.html` 의 각 `<article>`. 영어는 같은 `data-i18n` 키로 `i18n.js` 의 `EN` 에 있어요.
- **Farm Idler 업데이트**: Farm-Idler-Build 의 `web/Build/` 를 `play/farm-idler/Build/` 에 덮어쓰기.
- **Big Walk 업데이트**: 원본 `src/shared/{palette,items,character,daruma}.js`, `src/renderer/companion.js` 를 `play/big-walk/` 에 덮어쓰기. `index.html` 의 `window.companion` 이 Electron preload 를 대신해요.

## 숨은 것들

- 키보드로 `nebbi` 또는 ↑↑↓↓←→←→BA → 포도 비.
- 광산 카드가 보일 때 타자를 치면 곡괭이질이 돼요.
