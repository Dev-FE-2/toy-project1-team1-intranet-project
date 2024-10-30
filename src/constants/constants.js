// 내비게이션
export const NAV = {
  front: [
    {
      name: '내 정보',
      path: '/'
    },
    {
      name: '나의 근태',
      path: '/AbsencePortal'
    },
    {
      name: '공지',
      path: '/Announcement'
    }
  ],
  admin: [
    {
      name: '직원 정보 관리',
      path: '/admin'
    },
    {
      name: '공지사항 관리',
      path: '#none'
    }
  ]
};

export const NO_HEADER_PAGE = ['/join', '/join/login', '/join/signup'];