import './employeeList.css';
import '../../../reset.css';
import '../../../style.css';
import '../../../common.css';

import { fetchAllUsers } from '../../../utils/fetchAllUserData';

const employeeList = async () => {
  const CONTAINER = document.createElement('div');
  CONTAINER.className = 'container employee-list';
  CONTAINER.innerHTML = `
    <div class="container-header">
			<h1 class="title">직원 목록</h1>
			<div class="search-box">
				<input type="search" placeholder="어쩌구를 검색하세요.">
				<span class="material-symbols-outlined"> search </span>
			</div>
		</div>
		<div class="table-body">
			<ul class="table" role="list" aria-label="직원 목록" id='employee-data-ul'>

			</ul>
		</div>    <!-- 📌 페이지네이션은 추후 삭제 예정 => 컴포넌트로 바꾸지 않을까? 싶음 -->
		<div class="pagination">
			<ul class="paging-list" role="list">
				<li class="paging-item prev">
					<button class="btn" type="button" aria-label="이전 페이지">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 34 34">
							<line x1="20" y1="6" x2="12" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
							<line x1="12" y1="17" x2="20" y2="28" stroke="currentColor" stroke-width="2" stroke-linecap="round">
							</line>
						</svg>
					</button>
				</li>
				<!-- [D] 활성화된 li.is-active 클래스 추가 -->
				<li class="paging-item is-active" aria-current="page">
					<a href="javascript:void(0);">1</a>
				</li>
				<li class="paging-item"><a href="javascript:void(0);">2</a></li>
				<li class="paging-item"><a href="javascript:void(0);">3</a></li>
				<li class="paging-item"><a href="javascript:void(0);">4</a></li>
				<li class="paging-item"><a href="javascript:void(0);">5</a></li>
				<li class="paging-item next">
					<button class="btn" type="button" aria-label="다음 페이지">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 34 34">
							<line x1="14" y1="6" x2="22" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
							<line x1="22" y1="17" x2="14" y2="28" stroke="currentColor" stroke-width="2" stroke-linecap="round">
							</line>
						</svg>
					</button>
				</li>
			</ul>
		</div>
  `;

  try {
    const ALL_USERS = await fetchAllUsers();
    console.log(ALL_USERS); // 모든 사용자 데이터 확인

    // 📌 사용자 근무 상태 변환 필요
    // ALL_USERS 안에 있는 객체들의 isWorking : true인 경우 badge-success 클래스명 추가, textContent = '근무 중'으로 변경
    // isWorking: false인 경우 badge-error 클래스명 추가, textContent = '근무 중 아님'으로 변경

    const EMPLOYEE_DATA = CONTAINER.querySelector('#employee-data-ul');
    if (EMPLOYEE_DATA) {
      // 모든 사용자 데이터를 HTML로 변환
      EMPLOYEE_DATA.innerHTML = `
        <li class="col">
				  <ul class="head" role="list-head">
					  <li class="number">사번</li>
			  		<li class="profile-img">사진</li>
			  		<li class="name">이름</li>
			  		<li class="team">소속팀</li>
			  		<li class="role">직급</li>
			  		<li class="status">근무 상태</li>
			  	</ul>
		  	</li>
        ${ALL_USERS.map(
          users => 
            `
              <li class="col">
                <ul class="cell" role="list">
					  	    <li class="number">${users.employeeNumber}</li>
						      <li class="profile-img">
							      <div class="img-box">
								    <img src=${users.profileImg} alt="프로필 이미지 미리보기">
							      </div>
						      </li>
						      <li class="name">${users.name}</li>
						      <li class="team">${users.team}</li>
					  	    <li class="role">${users.role}</li>
					  	    <li class="user-status">
						  	    <div class="badge ${users.isWorking ? 'badge-success' : 'badge-error' }">
                      ${users.isWorking ? '근무 중' : '근무 중 아님'}
                    </div>
						      </li>
					      </ul>
              </li>      
            `,
        ).join('')}`;
    }
  } catch (error) {
    console.log('데이터 로드 실패:', error);
    const employeeData = CONTAINER.querySelector('#employee-data');
    if (employeeData) {
      employeeData.innerHTML = `<p>데이터를 불러오는데 실패했습니다.</p>`;
    }
  }

  // 디바이스 너비에 따라 사용자 근무 상태 UI 변경
  const USER_STATUS = CONTAINER.querySelectorAll('.user-status .badge');
  console.log(USER_STATUS);
  const MEDIA_QUERY_1230 = window.matchMedia('(max-width: 1230px)');
  const MEDIA_QUERY_768 = window.matchMedia('(max-width: 768px)');
  const MEDIA_QUERY_480 = window.matchMedia('(max-width: 480px)');

  const USER_STATUS_OG_VALUE = [...USER_STATUS].map(value => value.textContent);

  const updateUserStatus = () => {
    if (MEDIA_QUERY_1230.matches) {
      USER_STATUS.forEach(el => {
        el.textContent = '';
      });
    } else if (MEDIA_QUERY_768.matches) {
      USER_STATUS.forEach((el, index) => {
        el.textContent = USER_STATUS_OG_VALUE[index];
      });
    } else if (MEDIA_QUERY_480.matches) {
      USER_STATUS.forEach(el => {
        el.textContent = '';
      });
    } else {
      USER_STATUS.forEach((el, index) => {
        el.textContent = USER_STATUS_OG_VALUE[index];
        // 📌 추후 DB 데이터 추가 시, 다른 페이지로 이동했을 때도 정상 동작하는 지 확인
      });
    }
  };

  updateUserStatus();

  MEDIA_QUERY_1230.addEventListener('change', updateUserStatus);
  MEDIA_QUERY_768.addEventListener('change', updateUserStatus);
  MEDIA_QUERY_480.addEventListener('change', updateUserStatus);

  return CONTAINER;
};

export default employeeList;
