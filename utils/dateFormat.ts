// 날짜 문자열을 YYYY-MM-DD 형식으로 변환
export function formatDateString(input: string): string {
  // 숫자만 추출
  const numbers = input.replace(/\D/g, '');

  // 8자리 숫자인 경우 (YYYYMMDD)
  if (numbers.length === 8) {
    const year = numbers.substring(0, 4);
    const month = numbers.substring(4, 6);
    const day = numbers.substring(6, 8);
    return `${year}-${month}-${day}`;
  }

  // 6자리 숫자인 경우 (YYMMDD) - 2000년대로 가정
  if (numbers.length === 6) {
    const year = `20${numbers.substring(0, 2)}`;
    const month = numbers.substring(2, 4);
    const day = numbers.substring(4, 6);
    return `${year}-${month}-${day}`;
  }

  // 이미 올바른 형식이거나 다른 경우 그대로 반환
  return input;
}

// 날짜 유효성 검증
export function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

// 시간 문자열을 HH:MM 형식으로 변환
export function formatTimeString(input: string): string {
  // 숫자만 추출
  const numbers = input.replace(/\D/g, '');

  // 4자리 숫자인 경우 (HHMM)
  if (numbers.length === 4) {
    const hour = numbers.substring(0, 2);
    const minute = numbers.substring(2, 4);
    return `${hour}:${minute}`;
  }

  // 3자리 숫자인 경우 (HMM) - 0을 앞에 추가
  if (numbers.length === 3) {
    const hour = `0${numbers.substring(0, 1)}`;
    const minute = numbers.substring(1, 3);
    return `${hour}:${minute}`;
  }

  // 이미 올바른 형식이거나 다른 경우 그대로 반환
  return input;
}

// 시간 유효성 검증
export function isValidTime(timeString: string): boolean {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(timeString);
}

// 로컬 날짜/시간을 ISO 문자열로 변환 (타임존 문제 해결)
export function toLocalISOString(date: string, time: string): string {
  return `${date}T${time}:00`;
}

// ===== 한국어 날짜 표시용 함수들 =====

// "N월 D일" 형식 (홈 화면 등)
export function formatDateShort(dateString: string): string {
  const datePart = dateString.split('T')[0];
  const [, month, day] = datePart.split('-');
  return `${parseInt(month)}월 ${parseInt(day)}일`;
}

// "YYYY년 N월 D일" 형식 (상세 화면)
export function formatDateFull(dateString: string): string {
  const datePart = dateString.split('T')[0];
  const [year, month, day] = datePart.split('-');
  return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
}

// ISO 문자열에서 "HH:MM" 추출
export function formatTimeFromISO(dateString: string): string {
  const parts = dateString.split('T');
  if (parts.length < 2) return '';
  const timePart = parts[1].split('+')[0].split('-')[0].split('Z')[0];
  const [hour, minute] = timePart.split(':');
  return `${hour}:${minute}`;
}

// 한국어 요일 이름
export function getDayName(dateString: string): string {
  const date = new Date(dateString.split('T')[0]);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[date.getDay()];
}

// Date 객체에서 YYYY-MM-DD 추출 (타임존 안전)
export function getISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}
