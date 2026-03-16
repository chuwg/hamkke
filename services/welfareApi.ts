// 공공데이터포털 복지시설 API 서비스

const API_KEY = '74428a8f4121ca2541446f9964dc2164619660782e02548585bdf7c0f42760f3';
const BASE_URL = 'https://api.odcloud.kr/api';

// 장애인복지관 API
const WELFARE_CENTER_ENDPOINT = '/15075529/v1/uddi:ed5cbc13-b65a-49ac-b83d-cefcf9806fd3';
// 발달재활 제공기관 API
const REHAB_CENTER_ENDPOINT = '/15066351/v1/uddi:dbe15d48-f9de-47d5-b02b-e08395656e28';

// 장애인복지관 데이터 타입
export interface WelfareCenter {
  연번: number;
  시도: string;
  시군구: string;
  시설유형: string;
  법인현황: string;
  시설명: string;
  '시설 주소': string;
  전화번호: string;
  팩스번호: string | null;
  종사자정원: number;
  '종사자 현원': number;
  'X좌표'?: string;
  'Y좌표'?: string;
  '엑스(X)좌표'?: string;
  '와이(Y)좌표'?: string;
}

// 발달재활 제공기관 데이터 타입
export interface RehabCenter {
  시도: string;
  시군구: string;
  '제공 기관명': string;
  주소: string;
}

// API 응답 타입
interface ApiResponse<T> {
  currentCount: number;
  data: T[];
  matchCount: number;
  page: number;
  perPage: number;
  totalCount: number;
}

// 장애인복지관 조회
export async function fetchWelfareCenters(params: {
  page?: number;
  perPage?: number;
  sido?: string;
  sigungu?: string;
}): Promise<ApiResponse<WelfareCenter>> {
  const { page = 1, perPage = 20, sido, sigungu } = params;

  let url = `${BASE_URL}${WELFARE_CENTER_ENDPOINT}?page=${page}&perPage=${perPage}`;

  // 시도 필터 (cond 파라미터 사용)
  if (sido) {
    url += `&cond[시도::EQ]=${encodeURIComponent(sido)}`;
  }
  if (sigungu) {
    url += `&cond[시군구::EQ]=${encodeURIComponent(sigungu)}`;
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Infuser ${API_KEY}`,
      },
    });
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

// 발달재활 제공기관 조회
export async function fetchRehabCenters(params: {
  page?: number;
  perPage?: number;
  sido?: string;
  sigungu?: string;
}): Promise<ApiResponse<RehabCenter>> {
  const { page = 1, perPage = 20, sido, sigungu } = params;

  let url = `${BASE_URL}${REHAB_CENTER_ENDPOINT}?page=${page}&perPage=${perPage}`;

  if (sido) {
    url += `&cond[시도::EQ]=${encodeURIComponent(sido)}`;
  }
  if (sigungu) {
    url += `&cond[시군구::EQ]=${encodeURIComponent(sigungu)}`;
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Infuser ${API_KEY}`,
      },
    });
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

// 시도 목록
export const SIDO_LIST = [
  '서울', '서울특별시',
  '부산', '부산광역시',
  '대구', '대구광역시',
  '인천', '인천광역시',
  '광주', '광주광역시',
  '대전', '대전광역시',
  '울산', '울산광역시',
  '세종', '세종특별자치시',
  '경기', '경기도',
  '강원', '강원특별자치도',
  '충북', '충청북도',
  '충남', '충청남도',
  '전북', '전북특별자치도',
  '전남', '전라남도',
  '경북', '경상북도',
  '경남', '경상남도',
  '제주', '제주특별자치도',
];

// 통합 시설 타입 (앱에서 사용)
export interface Facility {
  id: string;
  name: string;
  type: '복지관' | '발달재활';
  address: string;
  phone?: string;
  sido: string;
  sigungu: string;
  lat?: number;
  lng?: number;
}

// 복지관 데이터를 앱 형식으로 변환
export function transformWelfareCenter(center: WelfareCenter, index: number): Facility {
  const xCoord = center['엑스(X)좌표'] || center['X좌표'];
  const yCoord = center['와이(Y)좌표'] || center['Y좌표'];

  return {
    id: `welfare-${center.연번 || index}`,
    name: center.시설명,
    type: '복지관',
    address: center['시설 주소'] || '',
    phone: center.전화번호 || undefined,
    sido: center.시도,
    sigungu: center.시군구,
    lat: yCoord ? parseFloat(yCoord) : undefined,
    lng: xCoord ? parseFloat(xCoord) : undefined,
  };
}

// 발달재활 데이터를 앱 형식으로 변환
export function transformRehabCenter(center: RehabCenter, index: number): Facility {
  return {
    id: `rehab-${index}`,
    name: center['제공 기관명'],
    type: '발달재활',
    address: center.주소,
    sido: center.시도,
    sigungu: center.시군구,
  };
}
