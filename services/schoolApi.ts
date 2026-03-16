// NEIS 교육정보 개방 포털 API 서비스

const API_KEY = '97ee1075671f4382897803007f058b05';
const BASE_URL = 'https://open.neis.go.kr/hub';

// 시도교육청 코드
export const REGION_CODES: { code: string; name: string }[] = [
  { code: '', name: '전체 지역' },
  { code: 'B10', name: '서울특별시' },
  { code: 'C10', name: '부산광역시' },
  { code: 'D10', name: '대구광역시' },
  { code: 'E10', name: '인천광역시' },
  { code: 'F10', name: '광주광역시' },
  { code: 'G10', name: '대전광역시' },
  { code: 'H10', name: '울산광역시' },
  { code: 'I10', name: '세종특별자치시' },
  { code: 'J10', name: '경기도' },
  { code: 'K10', name: '강원특별자치도' },
  { code: 'M10', name: '충청북도' },
  { code: 'N10', name: '충청남도' },
  { code: 'P10', name: '전북특별자치도' },
  { code: 'Q10', name: '전라남도' },
  { code: 'R10', name: '경상북도' },
  { code: 'S10', name: '경상남도' },
  { code: 'T10', name: '제주특별자치도' },
];

// 학교 유형
export const SCHOOL_TYPES = [
  { code: '', name: '전체' },
  { code: '초등학교', name: '초등학교' },
  { code: '중학교', name: '중학교' },
  { code: '고등학교', name: '고등학교' },
  { code: '특수학교', name: '특수학교' },
];

// NEIS API 학교 정보 타입
export interface NeisSchool {
  ATPT_OFCDC_SC_CODE: string; // 시도교육청코드
  ATPT_OFCDC_SC_NM: string; // 시도교육청명
  SD_SCHUL_CODE: string; // 표준학교코드
  SCHUL_NM: string; // 학교명
  ENG_SCHUL_NM: string; // 영문학교명
  SCHUL_KND_SC_NM: string; // 학교종류명
  LCTN_SC_NM: string; // 소재지명
  JU_ORG_NM: string; // 관할조직명
  FOND_SC_NM: string; // 설립명 (공립/사립)
  ORG_RDNZC: string; // 도로명우편번호
  ORG_RDNMA: string; // 도로명주소
  ORG_RDNDA: string; // 도로명상세주소
  ORG_TELNO: string; // 전화번호
  HMPG_ADRES: string; // 홈페이지주소
  COEDU_SC_NM: string; // 남녀공학구분명
  ORG_FAXNO: string; // 팩스번호
  HS_SC_NM: string; // 고등학교구분명
  INDST_SPECL_CCCCL_EXST_YN: string; // 산업체특별학급존재여부
  HS_GNRL_BUSNS_SC_NM: string; // 고등학교일반실업구분명
  SPCLY_PURPS_HS_ORD_NM: string | null; // 특수목적고등학교계열명
  ENE_BFE_SEHF_SC_NM: string; // 입시전후기구분명
  DGHT_SC_NM: string; // 주야구분명
  FOND_YMD: string; // 설립일자
  FOAS_MEMRD: string; // 개교기념일
  LOAD_DTM: string; // 수정일
}

// API 응답 타입
interface NeisApiResponse {
  schoolInfo?: [
    { head: [{ list_total_count: number }, { RESULT: { CODE: string; MESSAGE: string } }] },
    { row: NeisSchool[] }
  ];
  RESULT?: { CODE: string; MESSAGE: string };
}

// 앱에서 사용할 학교 타입
export interface School {
  id: string;
  name: string;
  engName: string;
  type: string;
  address: string;
  addressDetail: string;
  phone: string;
  fax: string;
  website: string;
  region: string;
  regionCode: string;
  foundationType: string; // 공립/사립
  coedu: string; // 남녀공학
  foundedDate: string;
}

// NEIS 데이터를 앱 형식으로 변환
export function transformNeisSchool(school: NeisSchool): School {
  return {
    id: school.SD_SCHUL_CODE,
    name: school.SCHUL_NM,
    engName: school.ENG_SCHUL_NM || '',
    type: school.SCHUL_KND_SC_NM,
    address: school.ORG_RDNMA || '',
    addressDetail: school.ORG_RDNDA || '',
    phone: school.ORG_TELNO || '',
    fax: school.ORG_FAXNO || '',
    website: school.HMPG_ADRES || '',
    region: school.LCTN_SC_NM,
    regionCode: school.ATPT_OFCDC_SC_CODE,
    foundationType: school.FOND_SC_NM,
    coedu: school.COEDU_SC_NM,
    foundedDate: school.FOND_YMD,
  };
}

// 학교 정보 조회
export async function fetchSchools(params: {
  page?: number;
  perPage?: number;
  regionCode?: string;
  schoolType?: string;
  schoolName?: string;
}): Promise<{ schools: School[]; totalCount: number }> {
  const { page = 1, perPage = 50, regionCode, schoolType, schoolName } = params;

  let url = `${BASE_URL}/schoolInfo?KEY=${API_KEY}&Type=json&pIndex=${page}&pSize=${perPage}`;

  if (regionCode) {
    url += `&ATPT_OFCDC_SC_CODE=${regionCode}`;
  }
  if (schoolType) {
    url += `&SCHUL_KND_SC_NM=${encodeURIComponent(schoolType)}`;
  }
  if (schoolName) {
    url += `&SCHUL_NM=${encodeURIComponent(schoolName)}`;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data: NeisApiResponse = await response.json();

    // 데이터가 없는 경우
    if (data.RESULT?.CODE === 'INFO-200') {
      return { schools: [], totalCount: 0 };
    }

    if (!data.schoolInfo) {
      return { schools: [], totalCount: 0 };
    }

    const totalCount = data.schoolInfo[0].head[0].list_total_count;
    const schools = data.schoolInfo[1].row.map(transformNeisSchool);

    return { schools, totalCount };
  } catch (error) {
    throw error;
  }
}

// 특수학교 조회
export async function fetchSpecialSchools(params: {
  page?: number;
  perPage?: number;
  regionCode?: string;
}): Promise<{ schools: School[]; totalCount: number }> {
  return fetchSchools({
    ...params,
    schoolType: '특수학교',
  });
}

// 학교 상세 정보 조회
export async function fetchSchoolDetail(
  regionCode: string,
  schoolCode: string
): Promise<School | null> {
  const url = `${BASE_URL}/schoolInfo?KEY=${API_KEY}&Type=json&pIndex=1&pSize=1&ATPT_OFCDC_SC_CODE=${regionCode}&SD_SCHUL_CODE=${schoolCode}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data: NeisApiResponse = await response.json();

    if (!data.schoolInfo || data.RESULT?.CODE === 'INFO-200') {
      return null;
    }

    return transformNeisSchool(data.schoolInfo[1].row[0]);
  } catch (error) {
    throw error;
  }
}
