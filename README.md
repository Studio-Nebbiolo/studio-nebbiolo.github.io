# Studio Nebbiolo

홈 · 프로덕트들 · 소개로 구성된 정적 스튜디오 사이트입니다. 빌드나 의존성 설치 없이 실행됩니다.

```bash
cd /workspace/studio-nebbiolo.github.io
python3 -m http.server 8000 --bind 127.0.0.1
```

실행 중인 서버에서 확인하세요. `file://`로 열면 Farm Idler의 WebAssembly 로딩이 동작하지 않습니다.

## 구조

- `index.html`: 섹션, 프로덕트 카드, 상세창의 `<template>`
- `assets/css/style.css`: 밝은/어두운 테마와 반응형 레이아웃
- `assets/js/main.js`: 메뉴, 스크롤 진행, 테마 저장, 드래그 가능한 홈 도형
- `assets/js/products.js`: 프로덕트 상세창과 카드 인터랙션
- `assets/img/products/`: 프로덕트 대표 이미지
- `play/farm-idler/`: 프로덕트 목록에서 연결하지 않는 기존 WebGL 데모

프로덕트를 수정할 때 카드의 `data-product`와 상세 템플릿의 `id="product-…"`를 맞춰 주세요. 상세 템플릿에는 이름, 짧은 소개, 이용 링크와 원본 리포지토리 링크가 들어갑니다. 목록에는 이름과 이미지만 표시합니다. 캡션이나 작은 영문 라벨을 추가하지 않습니다.

## 프로덕트 순서와 링크

| 이름 | 원본 리포지토리 | 이용 링크 |
| --- | --- | --- |
| 뽁뽁이공장 | [Bbokgong](https://github.com/Studio-Nebbiolo/Bbokgong) | [브라우저](https://studio-nebbiolo.github.io/Bbokgong/) |
| 무림 문파 감별록 | [MyMurim](https://github.com/Studio-Nebbiolo/MyMurim) | [브라우저](https://studio-nebbiolo.github.io/MyMurim/) |


## 대표 이미지 출처

- `bbokgong-preview.png`: Bbokgong `47e2ad04`의 실제 캔버스 캡처. 원본과 같은 Three.js 0.128.0을 사용하고 캡처할 때 조작 UI만 숨겼습니다.
- `murim-landscape.jpg`: MyMurim `e308dd3c`의 `images/scene-huashan.jpg`.

원본 자산의 권리와 라이선스는 각 프로젝트를 따릅니다. 캡처 도구와 조사용 체크아웃은 홈페이지 배포에 포함하지 않습니다.
