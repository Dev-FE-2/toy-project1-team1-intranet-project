import Header from './components/layouts/header/Header';
import Main from './pages/front/Main';
import Announcement from './pages/front/Announcement/Announcement';
import AbsencePortal from './pages/front/AbsencePortal/AbsencePortal';
import initJoinPage from './pages/front/join/join';
import employeeList from './pages/admin/employeeList/employeeList';
import { NO_HEADER_PAGE } from './constants/constants';
import { AUTH } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import pageNotFound from './pages/front/pageNotFound/pageNotFound';

const loadStylesheet = href => {
  const existingLink = document.querySelector('link[data-role="page-style"]');

  if (existingLink) {
    existingLink.setAttribute('href', href);
  } else {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute('data-role', 'page-style');
    document.head.appendChild(link);
  }
};

// 로그인 된 상태인지 판별하기
const checkAuthState = () => {
  return new Promise((resolve, reject) => {
    const path = window.location.pathname;
    if (path.startsWith('/join')) {
      resolve(false); // /join 페이지에서는 확인하지 않음(무한루프 도니까)
    } else {
      onAuthStateChanged(AUTH, user => {
        if (!user) {
          goToPage('/join');
          reject(new Error('User not authenticated'));
        } else {
          resolve(user);
        }
      });
    }
  });
};

const app = async () => {
  try {
    // 로그인 상태 확인
    await checkAuthState();
    init();
    route();
  } catch (err) {
    console.error(err.message);
  }
};

const init = () => {
  window.addEventListener('popstate', route);
  document.body.addEventListener('click', navigatePage);
};

const navigatePage = event => {
  

  const anchor = event.target.closest('a');

  if (anchor && anchor.href) {
    event.preventDefault();
    history.pushState(null, null, anchor.href);
    route();
  }
};

export const goToPage = (url) => {
  history.pushState(null, null, url);
  route();
};

const route = async () => {
  const path = window.location.pathname;
  const content = document.querySelector('#app');

  // 라우팅할 때마다 로그인 판별
  try {
    await checkAuthState();
  } catch (err) {
    console.error(err.message);
    return;
  }

  const ADMIN_USER_MATCH = path.match(/^\/admin\/(\w+)$/);
  if (ADMIN_USER_MATCH) {
    const USER_UID = ADMIN_USER_MATCH[1];
    content.innerHTML = '';
    content.appendChild(await employeeList(USER_UID));
    loadStylesheet('./src/pages/admin/employeeList/employeeList.css');
    return;
  }

  // 헤더 호출
  const renderHeader = async () => {
    const headerEle = document.querySelector('.header');
    const isHeaderImport = !!headerEle; // 헤더 한번만 호출하도록
    const {headerHtml, logoutButton} = await Header(path);
    if(!(NO_HEADER_PAGE.includes(path)) && !isHeaderImport) {
      content.insertAdjacentHTML('beforebegin', headerHtml);
      logoutButton.buttonClickEvent();
    } else if(NO_HEADER_PAGE.includes(path) && isHeaderImport) {
      // 헤더가 한번 호출된 상태에서 NO_HEADER_PAGE로 이동하면 헤더가 남아있음. 이를 제거하기 위함
      headerEle.remove();
    };
  };
  
  await renderHeader();
  
  switch (path) {
    case '/':
        Main(content);
        loadStylesheet('./src/pages/front/main.css');
      break;
    case '/Announcement':
      Announcement();
      loadStylesheet('./src/pages/front/announcement/announcement.css');
      break;
    case '/AbsencePortal':
      AbsencePortal();
      loadStylesheet('./src/pages/front/AbsencePortal/absencePortal.css');
      break;
    case '/join':
      loadStylesheet('./src/pages/front/join/join.css');
      initJoinPage(content, 'login');
      break;
    case '/admin':
      content.innerHTML = '';
      content.appendChild(await employeeList());
      loadStylesheet('./src/pages/admin/employeeList/employeeList.css');
      break;
    default:
      pageNotFound();
      break;
  }
};

document.addEventListener('DOMContentLoaded', app);
