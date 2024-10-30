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
      path: '/admin',
    },
    {
      name: '공지사항 관리',
      path: '#none',
    },
  ],
};

export const NO_HEADER_PAGE = ['/join', '/join/login', '/join/signup'];
