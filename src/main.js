import Header from './components/layouts/header/Header';
import Main from './pages/front/Main';
import Announcement from './pages/front/Announcement/Announcement';
import AbsencePortal from './pages/front/AbsencePortal/AbsencePortal';
import initJoinPage from './pages/front/join/join';
import employeeList from './pages/admin/employeeList/employeeList';
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

const app = () => {
  init();
  route();
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

const route = async () => {
  const path = window.location.pathname;
  const content = document.querySelector('#app');

  const renderHeader = async () => {
    content.insertAdjacentHTML('beforebegin', await Header());
  };
  renderHeader();

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
      // case '/join/login':
      loadStylesheet('./src/pages/front/join/join.css');
      initJoinPage(content, 'login');
      break;
    // case '/join/signup':
    //   loadStylesheet('./src/pages/front/join/join.css');
    //   initJoinPage(content, 'signup');
    //   break;
    case '/admin':
      content.innerHTML = '';
      const test = await employeeList()
      content.appendChild(test);
      loadStylesheet('./src/pages/admin/employeeList/employeeList.css');
      break;
    default:
      pageNotFound();
      break;
  }
};

document.addEventListener('DOMContentLoaded', app);
