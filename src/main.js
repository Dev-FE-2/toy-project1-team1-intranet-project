// import Page from './pages/Page';
// import Support from './pages/Support';
// import download from './pages/Download';
// import pageNotFound from './pages/PageNotFound';
import Main from './pages/front/Main';
import Announcement from './pages/front/Announcement';

const loadStylesheet = href => {
  const existingLink = document.querySelector('link[data-role="page-style"]');

  // 기존에 스타일 시트가 있으면 교체, 없으면 새로 생성
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
  // 초기화
  window.addEventListener('popstate', route); // 뒤로가기, 앞으로가기 시 발생하는 이벤트. route() 호출해서 리로드
  document.body.addEventListener('click', navigatePage); // 본문에서 a 클릭 시 navigatePage() 호출
};

const navigatePage = event => {
  event.preventDefault(); // a태그 기본 동작 삭제(새로고침 막기)

  const anchor = event.target.closest('a'); //클릭요소중 가장 가까운 a 찾기

  if (anchor && anchor.href) {
    history.pushState(null, null, anchor.href); //url을 변경한 하고 히스토리 추가
    route();
  }
};

const route = () => {
  // 경로에 맞는 페이지 노출
  const path = window.location.pathname;
  const content = document.querySelector('#app');
  // const downloadPage = new Page('#content', download());
  // const supportPage = new Support({ title: 'Support' });

  switch (path) {
    case '/':
      Main(content);
      break;
    // case '/about':
    //   content.innerHTML = '<h1>About</h1>'; //루트 경로. 하드코딩2
    //   break;
    case '/Announcement':
      content.innerHTML = Announcement();
      loadStylesheet('/src/pages/front/announcement.css');
      break;
    // case '/support':
    //   content.innerHTML = supportPage.render(); //클래스로 정의하는 방식
    //   break;
    default:
      // content.innerHTML = pageNotFound(); // 단순 함수로 정의하는 방식
      break;
  }
};

document.addEventListener('DOMContentLoaded', app); // 돔이 모두 로드되면 app()실행
