# MAP

동대문구 무료 공간 지도

돈을 쓰지 않아도 머물 수 있는 동대문구의 무료·공공 제3의 공간을 탐색하는 한국어 지도 웹사이트입니다.

**현재는 공간 조사 전 단계입니다. 실제·예시·가상 장소 데이터와 장소 마커는 모두 0개입니다.** 배경지도에 원래 표시된 상호·시설은 이 서비스에 등록된 장소가 아닙니다.

## 실행

Node.js 22.12 이상(권장: 24 LTS)과 npm이 필요합니다.

```sh
npm ci
npm run dev
```

개발 서버가 표시하는 로컬 주소로 접속합니다. 기본 주소는 `http://127.0.0.1:5173/`입니다.

```sh
npm test           # 빈 데이터 계약, URL 변환, 링크 검증
npm run typecheck  # TypeScript 검사
npm run build      # 타입 검사 후 dist/ 생성
npm run preview    # 프로덕션 빌드 미리보기
```

## 주요 기능

- 데스크톱의 검색·필터·목록 패널과 동대문구 중심 지도
- 모바일의 지도 중심 화면과 네이티브 dialog 기반 필터·목록 하단 패널
- 이름, 주소, 설명, 카테고리 검색
- 목적 7개, 유형 9개, 시설 5개, 이용 조건 5개의 복수 선택
- 검색·필터와 URL 쿼리 동기화, 새로고침·뒤로/앞으로 복원
- 장소 추가 시 자동으로 표시되는 카드·마커·상세 정보와 선택 동기화
- 등록 장소 없음과 조건에 맞는 장소 없음의 서로 다른 안내
- 지도 로딩 오류 안내·재시도, 동대문구 전체 보기, OSM 출처 표시

## 데이터 추가

`src/data/places.ts`의 `places` 배열에 직접 조사·확인한 레코드만 추가합니다. 현재 파일은 다음 상태를 유지합니다.

```ts
import type { Place } from '../types/place';

export const places: Place[] = [];
```

스키마 전체는 `src/types/place.ts`에서 관리합니다. 새 필드는 이 인터페이스에 선택적으로 추가할 수 있습니다. `id`는 중복되지 않아야 하며 좌표는 WGS84 십진수 위도·경도 순서입니다.

| 필드 | 의미 |
| --- | --- |
| id, name | 고유 ID, 공간 이름 |
| category | library, youth, community, culture, public_lounge, park, plaza, university, other |
| address, district | 주소, 동대문구 |
| latitude, longitude | 위도, 경도 |
| free, purchaseRequired | 무료 여부, 구매 필요 여부(필수) |
| purposes | study, work, rest, conversation, waiting, reading, meeting의 배열 |
| description, openingHours | 설명, 운영시간(선택) |
| indoor, outdoor | 실내·야외 여부(선택) |
| wifi, outlet, restroom, desk | 시설 여부(선택) |
| conversationAllowed, laptopFriendly, foodAllowed | 대화·노트북 적합성·음식 반입(선택) |
| reservationRequired, wheelchairAccessible | 예약 필요·휠체어 접근(선택) |
| source, sourceUrl, lastVerified | 정보 출처, 공식 웹 링크, 마지막 확인 날짜(선택) |
| imageUrl | 조사한 공간의 이미지 웹 주소(선택) |

확인하지 않은 선택 필드는 생략합니다. `undefined`는 미확인이며 `false`와 다릅니다. 필수 이용 조건을 확인하기 전에는 레코드를 게시하지 않습니다. 실제 데이터를 추가하고 `main`에 반영하면 자동으로 재배포됩니다. UI를 수정할 필요가 없습니다.

## 검색과 필터 규칙

- `src/utils/searchPlaces.ts`: 공백·영문 대소문자·유니코드를 정규화하고 검색어의 모든 단어가 이름·주소·설명·유형 텍스트에 포함되는지 확인합니다.
- `src/utils/filterPlaces.ts`: 입력 데이터를 변경하지 않는 순수 함수입니다.
- 목적 그룹 내부는 OR, 유형 그룹 내부도 OR입니다.
- 검색과 서로 다른 필터 그룹 사이에는 AND를 적용합니다.
- 시설·이용 조건은 선택한 항목을 모두 만족해야 합니다. 실내와 야외를 함께 선택하면 두 조건이 모두 확인된 공간만 표시합니다.
- 구매 필요 없음은 `purchaseRequired === false`, 예약 필요 없음은 `reservationRequired === false`입니다.
- 미확인 값은 선택한 true·false 조건 어느 쪽도 충족하지 않습니다.
- 무료 또는 구매 불필요 조건은 초기에는 선택하지 않습니다. 등록 공간의 이용 조건을 그대로 표시하며 사용자가 명시적으로 필터링할 수 있습니다.

## URL 규칙

`q`는 검색어, `purpose`와 `category`는 반복 가능한 키입니다. 조건은 `true` 또는 `false`를 사용합니다.

```text
?purpose=study&purpose=reading&wifi=true
?category=library&indoor=true&purchaseRequired=false
```

`src/utils/searchParams.ts`에서 변환하고 `src/hooks/useSearchState.ts`에서 브라우저와 연결합니다. 잘못된 값과 중복 항목은 무시합니다. 다른 용도의 쿼리와 URL 경로·해시는 보존합니다. 타이핑은 현재 기록을 교체하고 필터 변경·초기화는 기록을 추가합니다.

## 지도 설정 및 확장

- `src/config/region.ts`: 표시 지역, 초기 bounds, 여유 있는 이동 bounds, 타일 주소, 출처 및 경계 레이어 설정.
- 초기 bounds는 [동대문구 통계연보](https://www.ddm.go.kr/upload/info/z2020statistics.pdf)의 지역 극점(인쇄면 56)을 포함하도록 여유를 둔 화면 범위입니다. 행정경계 자체를 나타내지 않습니다.
- `region.boundary`는 현재 `null`입니다. 검증된 GeoJSON을 연결하면 경계를 표시할 수 있습니다.
- 마커 클러스터링은 `MapView`의 마커 렌더링 부분에서 추가할 수 있습니다.
- 자연어 검색은 파서가 `SearchState`와 `PlaceFilters`를 반환하도록 연결합니다. 기존 검색·필터 함수는 유지할 수 있습니다. 현재 LLM이나 외부 검색 API 연결은 없습니다.

기본 타일은 OpenStreetMap입니다. [공식 타일 정책](https://operations.osmfoundation.org/policies/tiles/)에 따라 출처와 브라우저 Referer를 유지하고, 대량 다운로드·오프라인 타일 저장 기능은 제공하지 않습니다. 배경지도 표시는 인터넷 연결에 의존합니다.

다른 타일 공급자로 바꿀 때는 `.env.example`에 설명한 `VITE_TILE_URL`과 `VITE_TILE_ATTRIBUTION`을 함께 설정하고 빌드합니다. 환경변수에는 공개 가능한 설정만 입력합니다.

## GitHub Pages 배포

대상 저장소: [gklx2/MAP](https://github.com/gklx2/MAP)

배포가 완료되면 서비스 주소는 `https://gklx2.github.io/MAP/`입니다. 실제 배포 상태는 저장소 Actions에서 확인합니다.

1. 저장소의 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정합니다.
2. 소스와 `package-lock.json`을 `main` 브랜치에 push합니다.
3. `.github/workflows/deploy.yml`이 `npm ci` → 테스트 → 타입 검사·Vite 빌드 → Pages artifact 업로드 → 배포를 실행합니다.
4. Actions의 `Deploy map to GitHub Pages`가 성공한 후 서비스 주소에 접속합니다. Actions 탭에서 수동 실행도 가능합니다.

`vite.config.ts`는 Actions의 `GITHUB_REPOSITORY`로 실제 저장소 이름을 읽어 `base`를 설정합니다. `gklx2/MAP`에서는 `/MAP/`을 사용하며, 로컬에서는 `/`을 사용합니다. 따라서 저장소 이름이 바뀌어도 Actions에서는 경로를 자동 반영합니다. 사용자 사이트 저장소(`*.github.io`)는 `/`을 사용합니다.

로컬에서 배포 경로와 동일하게 확인하려면 다음과 같이 실행합니다.

```sh
VITE_BASE_PATH=/MAP/ npm run build
npm run preview
```

이 경우 preview 주소에 `/MAP/`을 붙여 접속합니다. 사용자 도메인을 쓰거나 수동으로 경로를 지정하려면 `VITE_BASE_PATH`를 지정합니다.

배포 실패 시 먼저 Pages의 Source, Actions 권한 및 실행 로그를 확인합니다. 별도 서버·API 키·유료 지도 계정은 필요하지 않습니다.

## 검증 범위

- TypeScript 검사, 프로덕션 빌드 및 순수 함수 테스트를 실행합니다.
- 실제·가상 Place 레코드는 테스트에도 생성하지 않습니다.
- 현재 비어 있지 않은 데이터의 카드·마커·상세 상호작용은 타입 검사와 코드 경로 검토로 확인합니다. 직접 조사한 장소를 추가하면 해당 흐름을 브라우저에서 추가 검증해야 합니다.
- 사용자 컴퓨터의 브라우저 자동화 연결이 응답하지 않아 이번 실행에서 시각적·모바일 브라우저 QA는 완료하지 못했습니다. 반응형 CSS와 네이티브 모달 접근성 구조는 구현되어 있습니다.

계획과 승인 기록은 `plan.md`에 있습니다.
