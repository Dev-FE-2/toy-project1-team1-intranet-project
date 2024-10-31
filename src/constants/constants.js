// 내비게이션
export const NAV = {
  front: [
    {
      name: '내 정보',
      path: '/',
    },
    {
      name: '부재 내역 및 신청',
      path: '/AbsencePortal',
    },
    {
      name: '공지사항',
      path: '/Announcement',
    },
  ],
  admin: [
    {
      name: '직원 정보 관리',
      path: '/admin?pagetype=employee',
    },
    {
      name: '공지사항 관리',
      path: '/admin?pagetype=notice',
    },
  ],
};

export const ABSENCE_TYPES_LABELS = {
  'am-half': '오전반차',
  'pm-half': '오후반차',
  annual: '연차',
  official: '공가',
  sick: '병가',
  alternative: '대체휴가',
};

export const NO_HEADER_PAGE = ['/join', '/join/login', '/join/signup'];
