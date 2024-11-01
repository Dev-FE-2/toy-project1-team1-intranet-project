import { NAV } from '/src/constants/constants';
import { AUTH } from '../../../../firebaseConfig';
import { fetchCurrentUserData } from '@utils/fetchCurrentUserData';
import './header.css';
import createButton from '@components/Button/Button';
import { goToPage } from '/src/main';


const Header = async (path) => {

  let userData;
  let userName;
  let userImgSrc;

  try {
    userData = await fetchCurrentUserData();

    // 유저 데이터(이름, 사진)
    userName = userData.name;
    userImgSrc = userData.profileImg;
  } catch (err) {
    console.error('err', err)
  }

  // 내비게이션 목록 데이터
  const frontNav = NAV.front;
  const adminNav = NAV.admin;

  // 어드민인지 유저페이지인지 판별 필요
  const isAdmin = path.startsWith('/admin');

  // 내비게이션 항목 생성기
  const createNavItems = (navItems) => {
    return navItems.map(data => `
      <li>
        <a href="${data.path}">
          ${data.name}
        </a>
      </li>
    `).join('');
  };

  // 로그아웃 버튼
  const logoutButton = createButton({
    classList: ['btn', 'btn-outline'],
    id: 'header-logout-button',
    text: '로그아웃',
    onClick: async () => {
      await AUTH.signOut();
      goToPage('/join');
    }
  });

  const headerHtml = `
    <header class="header">
      <div class="user-info-wrapper">
        <div class="user-img-box">
          <!-- 프로필 페이지 링크 넣기 -->
          <a href="#none">
            <img src="${userImgSrc}" alt="프로필 이미지">
          </a>
        </div>
        <div class="user-info">
          <!-- 프로필 페이지 링크 넣기 -->
          <a href="#none" class="user-name">${userName}</a>
          ${logoutButton.render()}
        </div>
      </div>
      <nav>
        <ul>
          ${isAdmin ? createNavItems(adminNav) : createNavItems(frontNav)}
        </ul>
      </nav>
    </header>
  `;

  return {headerHtml, logoutButton}
}

export default Header;