# Studio Nebbiolo

만든 것들 · 소개로 구성된 정적 스튜디오 사이트입니다. 빌드나 의존성 설치 없이 실행됩니다.

```bash
cd /workspace/studio-nebbiolo.github.io
python3 -m http.server 8000 --bind 127.0.0.1
```

실행 중인 서버에서 확인하세요. `file://`로 열면 Farm Idler의 WebAssembly 로딩이 동작하지 않습니다.

## 구조

- `index.html`: 섹션, 프로덕트 카드, 상세창의 `<template>`
- `assets/css/style.css`: 밝은/어두운 테마와 반응형 레이아웃
- `assets/js/main.js`: 메뉴, 스크롤 진행, 테마 저장
- `assets/js/i18n.js`: 한/영 번역과 언어 선택 저장
- `assets/img/favicon.svg`: 헤더 로고 심볼과 브라우저 탭이 함께 사용하는 아이콘
- `assets/js/products.js`: 프로덕트 상세창과 카드 인터랙션
- `assets/js/contact.js`: 문의 이메일 주소 복사와 상태 안내
- `assets/js/about.js`: 소개의 SVG 바람개비, 클릭·터치·키보드 인터랙션
- `assets/img/products/`: 프로덕트 대표 이미지
- `play/farm-idler/`: 프로덕트 목록에서 연결하지 않는 기존 WebGL 데모

프로덕트를 수정할 때 카드의 `data-product`와 상세 템플릿의 `id="product-…"`를 맞춰 주세요. 상세 템플릿에는 이름, 짧은 소개, 이용 링크가 들어갑니다. 목록에는 이름과 이미지만 표시합니다. 캡션이나 작은 영문 라벨을 추가하지 않습니다.

## 프로덕트 순서와 링크

| 이름 | 원본 리포지토리 | 이용 링크 |
| --- | --- | --- |
| 뽁뽁이 공장 | [Bbokgong](https://github.com/Studio-Nebbiolo/Bbokgong) | [브라우저](https://studio-nebbiolo.github.io/Bbokgong/) |
| 무림 문파 감별록 | [MyMurim](https://github.com/Studio-Nebbiolo/MyMurim) | [브라우저](https://studio-nebbiolo.github.io/MyMurim/) |


## 대표 이미지 출처

- `bbokgong-preview.png`: Bbokgong `47e2ad04`의 실제 캔버스 캡처. 원본과 같은 Three.js 0.128.0을 사용하고 캡처할 때 조작 UI만 숨겼습니다.
- `murim-landscape.jpg`: MyMurim `e308dd3c`의 `images/scene-huashan.jpg`.

원본 자산의 권리와 라이선스는 각 프로젝트를 따릅니다. 캡처 도구와 조사용 체크아웃은 홈페이지 배포에 포함하지 않습니다.

색상은 `style.css`의 `--plum`(플럼), `--terracotta`(테라코타), `--blue`(더스티 블루)에서 관리합니다. 한/영 텍스트를 바꿀 때 `i18n.js`의 두 언어 사전도 함께 수정하세요. 번역은 상세창, 대체 텍스트, 접근성 이름에도 적용됩니다.

첫 화면은 두 프로덕트를 서로 다른 높이로 배치한 표지 형태의 컬렉션입니다. 모바일에서는 한 열로 정렬합니다. 홈 섹션과 놀이터는 제거했으며, 이전 `#home` 주소는 `#products`로 연결됩니다.

소개에서 ‘행복을’ 버튼이나 바람개비를 누르면 세 줄의 SVG 바람 선이 글자에서 바람개비로 흐릅니다. 날개·글자·중심 핀은 플럼 → 블루 → 테라코타 순으로 색상이 순환하며, 바람개비가 회전한 뒤 멈춥니다. 드래그·포인터 추적과 캔버스는 사용하지 않습니다. 회전·색상은 CSS 전환, 바람과 짧은 반응은 Web Animations API로 처리하며 지속적인 JavaScript 애니메이션 루프가 없습니다. 연타 시 이전 바람 효과를 취소하고 최대 5개의 유한 애니메이션만 실행합니다. 움직임 줄이기 설정에서는 90도로 즉시 회전합니다. 상세창에는 제품을 여는 링크만 표시하며 GitHub 링크는 넣지 않습니다.

## 링크 미리보기

대표 주소 `https://nebbiolo.studio/`에는 정적 Open Graph·Twitter 메타데이터가 있습니다. 공유 제목은 ‘네비올로 스튜디오’, 설명은 ‘세상에 행복을 뿌리기 위해.’이며 브라우저 탭 제목은 `Nebbiolo`입니다. 별도 프로덕트 사이트의 메타데이터는 변경하지 않습니다.

썸네일은 `assets/img/nebbiolo-share-v2.png`(1730×909, PNG)입니다. 이미지 생성 도구로 제작했으며 원본은 홈페이지 체크아웃 밖에 보존합니다. 이미지를 바꿀 때 파일명을 새 버전으로 만들고 `index.html`의 `og:image`, `og:image:secure_url`, `twitter:image`, 실제 이미지 크기·대체 텍스트를 함께 갱신하세요. 공유 서비스가 이전 미리보기를 캐시할 수 있습니다.

공유 썸네일 v2는 설명 문구 없이 홈페이지 워드마크를 참고한 로고와 세 가지 도형만 표시합니다. `og:description`·`twitter:description`의 설명은 유지합니다.

문의 주소는 소개 하단의 `inquiry@nebbiolo.studio`입니다. 주소를 누르면 `mailto:`로 메일 작성창을 열고, 복사 버튼은 클립보드에 주소를 복사합니다. 복사가 차단된 경우 주소를 선택해 직접 복사할 수 있게 합니다. 메일을 자동 발송하는 기능이나 별도 서버는 없습니다.
