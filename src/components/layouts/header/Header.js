import { NAV } from '/src/constants/constants';
import './header.css';
import { getFirestore, collection, getDoc } from 'firebase/firestore';
import { DB, AUTH } from '../../../../firebaseConfig';
import { fetchCurrentUserData } from '@utils/fetchCurrentUserData';


const Header = async () => {
  
  // 로그인&로그아웃, 유저 사진&이름 관련 만들어야함
  console.log(fetchCurrentUserData())

  // 유저 데이터(사진, 이름)
  const userImgSrc = 'https://cdn.pixabay.com/photo/2021/12/16/09/26/pomeranian-6874257_1280.jpg';
  const userName = '홍길동';

  // 내비게이션 목록 데이터
  const frontNav = NAV.front;
  const adminNav = NAV.admin;

  // 어드민인지 유저페이지인지 판별 필요
  const isAdmin = true;

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

  return `
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