import { NAV } from '/src/constants/constants';
import './header.css';

const Header = () => {
  const frontNav = NAV.front;
  const adminNav = NAV.admin;

  // 어드민인지 유저페이지인지 판별 필요
  const isAdmin = true;

  // nav 항목 생성기
  const createNavItems = (navItems) => {
    return navItems.map(data => `
      <li>
        <a href="${data.path}">
          ${data.name}
        </a>
      </li>
    `).join('');
  };

  return `
    <header class="header">
      <div class="user-info-wrapper">
        <div class="user-img-box">
          <!-- 프로필 페이지 링크 넣기 -->
          <a href="#none">
            <img src="https://cdn.pixabay.com/photo/2021/12/16/09/26/pomeranian-6874257_1280.jpg" alt="프로필 이미지">
          </a>
        </div>
        <div class="user-info">
          <!-- 프로필 페이지 링크 넣기 -->
          <a href="#none" class="user-name">홍길동</a>
          <button type="button" class="logout">로그아웃</button>
        </div>
      </div>
      <nav>
        <ul>
          ${isAdmin ? createNavItems(frontNav) : createNavItems(adminNav)}
        </ul>
      </nav>
    </header>
  `;
}

export default Header;