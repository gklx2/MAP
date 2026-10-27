# MAP

동대문구 무료 공간 지도

돈을 쓰지 않아도 머물 수 있는 동대문구의 무료·공공 제3의 공간을 탐색하는 한국어 지도 웹사이트입니다.

**현재는 공간 조사 전 단계입니다. 실제·예시·가상 장소 데이터와 장소 마커는 모두 0개입니다.** 배경지도에 원래 표시된 상호·시설은 이 서비스에 등록된 장소가 아닙니다.


## 주요 기능

- 데스크톱의 검색·필터·목록 패널과 동대문구 중심 지도
- 모바일의 지도 중심 화면과 네이티브 dialog 기반 필터·목록 하단 패널
- 이름, 주소, 설명, 카테고리 검색
- 목적 7개, 유형 9개, 시설 5개, 이용 조건 5개의 복수 선택
- 검색·필터와 URL 쿼리 동기화, 새로고침·뒤로/앞으로 복원
- 장소 추가 시 자동으로 표시되는 카드·마커·상세 정보와 선택 동기화
- 등록 장소 없음과 조건에 맞는 장소 없음의 서로 다른 안내
- 지도 로딩 오류 안내·재시도, 동대문구 전체 보기, OSM 출처 표시
- `SIG_CD: "11230"`인 동대문구 행정경계를 지도에 표시

행정경계는 `src/data/sig.geojson`에서 동대문구만 추출한 `src/data/dongdaemun.boundary.json`을 사용합니다. 원본을 갱신할 때는 추출본도 함께 갱신해야 하며, 테스트에서 두 파일의 일치를 확인합니다. 경계선은 지도 이동을 제한하지 않습니다.

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


## GitHub Pages 배포

대상 저장소: [gklx2/MAP](https://github.com/gklx2/MAP)

서비스 주소: **https://gklx2.github.io/MAP/**
