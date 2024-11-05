import { fetchCollectionData } from '../../../utils/fetchCollectionData';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore'; // 📌 추후 DB 저장 util로 변경 시 삭제 필요!
import { sendPasswordResetEmail } from 'firebase/auth';
import { DB, AUTH } from '../../../../firebaseConfig'; // 📌 추후 DB 저장 util로 변경 시 삭제 필요!
import { uploadFileToStorage } from '@utils/saveDataToDB';

const employee = async () => {
  const URL_PARAMS = new URLSearchParams(window.location.search);
  const INIT_SEARCH_VALUE = URL_PARAMS.get('search')?.trim().toLowerCase();
  const INIT_USER_INFO_VALUE = URL_PARAMS.get('userinfo');
  const ALL_USERS = await fetchCollectionData('users');
  const ONLINE_USERS = ALL_USERS.filter(user => user.isWorking === true);
  const NOT_APPROVED_USERS = ALL_USERS.filter(
    user => user.isApproved === false,
  );

  const CONTAINER = document.createElement('div');
  CONTAINER.className = 'container employee-list';
  CONTAINER.innerHTML = `
    <div class="container-header">
			<h1 class="title">직원 목록</h1>
			<div class="search-box">
				<input class="employeeList-search-input"  placeholder="직원 정보를 검색해 주세요.">
				<span class="material-symbols-outlined"> search </span>
			</div>
		</div>
    <div class='employee-number-box'>
        <div>총 <span>${ALL_USERS.length} </span>명</div>
        <div>|</div>
        <div><span>${ONLINE_USERS.length}</span> 명의 직원 근무 중</div>
        <div>|</div>
        <div><span>${NOT_APPROVED_USERS.length}</span> 명 승인 대기중</div>
    </div>
		<div class="table-body">
			<ul class="table" role="list" aria-label="직원 목록" id='employee-data-ul'>

			</ul>
		</div>
  `;

  // 직원 상세 페이지 렌더링
  const renderSpecificUserInfo = (userId, users) => {
    const SPECIFIC_USER_INFO = users.find(user => user.id === userId);

    if (SPECIFIC_USER_INFO) {
      CONTAINER.innerHTML = `
        <h2 class='title'>${SPECIFIC_USER_INFO.name}님의 상세 페이지</h2>
        <div class='user-profile'>
          <div class='profile-sub-info'>
            <img src="${SPECIFIC_USER_INFO.profileImg}" alt="기본유저이미지">
            <button class="btn btn-solid open-modal-btn">정보 수정</button>
          </div>
          <div class='profile-main-info'>
            <div>사번: ${SPECIFIC_USER_INFO.employeeNumber}</div>
            <div>이름: ${SPECIFIC_USER_INFO.name}</div>
            <div>소속: ${SPECIFIC_USER_INFO.team}</div>
            <div>직급: ${SPECIFIC_USER_INFO.role}</div>
            <div>연락처: ${SPECIFIC_USER_INFO.phone}</div>
            <div>이메일: ${SPECIFIC_USER_INFO.email}</div>
            <div>주소: ${SPECIFIC_USER_INFO.address}</div>
            <div class='badge ${SPECIFIC_USER_INFO.isWorking ? 'badge-success' : 'badge-error'}'>${SPECIFIC_USER_INFO.isWorking ? '근무 중' : '근무 중 아님'}
            </div>
          </div>
        </div>
        <div class="edit-profile-modal-wrapper">
        </div>
      `;
    }
    const OPEN_MODAL_BTN = CONTAINER.querySelector('.open-modal-btn');
    const EDIT_MODAL = CONTAINER.querySelector('.edit-profile-modal-wrapper');
    OPEN_MODAL_BTN.addEventListener('click', () =>
      renderEditModal(SPECIFIC_USER_INFO, EDIT_MODAL),
    );
  };

  const EMPLOYEE_DATA = CONTAINER.querySelector('#employee-data-ul');
  const SEARCH_INPUT = CONTAINER.querySelector('.employeeList-search-input');

  try {
    ALL_USERS.sort((a, b) => {
      if ((a.isApproved ?? true) !== (b.isApproved ?? true)) {
        return (a.isApproved ?? true) - (b.isApproved ?? true);
      }

      if ((a.isDeleted ?? false) !== (b.isDeleted ?? false)) {
        return (a.isDeleted ?? false) - (b.isDeleted ?? false);
      }

      if ((a.isWorking ?? false) !== (b.isWorking ?? false)) {
        return (b.isWorking ?? false) - (a.isWorking ?? false);
      }

      return a.name.localeCompare(b.name, 'ko');
    });

    const MEDIA_QUERY_1230 = window.matchMedia('(max-width: 1230px)');
    const MEDIA_QUERY_768 = window.matchMedia('(max-width: 768px)');
    const MEDIA_QUERY_480 = window.matchMedia('(max-width: 480px)');

    const USER_STATUS_OG_VALUE = [];

    // 디바이스 너비에 따라 사용자 근무 상태 값 처리 함수
    const updateUserStatus = () => {
      const USER_STATUS = EMPLOYEE_DATA.querySelectorAll('.badge');

      if (USER_STATUS_OG_VALUE.length === 0) {
        USER_STATUS.forEach(value => {
          USER_STATUS_OG_VALUE.push(value.textContent);
        });
      }

      if (MEDIA_QUERY_1230.matches) {
        USER_STATUS.forEach(el => {
          el.textContent = '';
        });
      } else {
        USER_STATUS.forEach((el, index) => {
          el.textContent = USER_STATUS_OG_VALUE[index];
        });
      }

      if (MEDIA_QUERY_768.matches) {
        USER_STATUS.forEach((el, index) => {
          el.textContent = USER_STATUS_OG_VALUE[index];
        });
      }
      if (MEDIA_QUERY_480.matches) {
        USER_STATUS.forEach(el => {
          el.textContent = '';
        });
      }
    };

    const renderEmployeeList = users => {
      if (EMPLOYEE_DATA) {
        // 모든 사용자 데이터를 HTML로 변환
        EMPLOYEE_DATA.innerHTML = `
        <li class="col">
				  <ul class="head" role="list-head">
					  <li class="number">사번</li>
			  		<li class="profile-img">사진</li>
			  		<li class="name">이름 / E-mail</li>
			  		<li class="team">소속팀</li>
			  		<li class="role">직급</li>
			  		<li class="status">근무 상태</li>
			  	</ul>
		  	</li>
        ${
          users.length === 0
            ? `<div class='no-result-searched'>검색 결과가 없습니다.</div>`
            : users
                .map(
                  user =>
                    `
              <li class="col ${user.isDeleted ? 'deleted-user-col' : ''}
              ${!user.isApproved ? 'notApproved-user-col' : ''}">
                <ul class="cell" role="list" data-id='${user.id}'>
					  	    <li class="number">${user.employeeNumber}</li>
						      <li class="profile-img">
							      <div class="img-box">
								    <img src=${user.profileImg} alt="프로필 이미지 미리보기">
							      </div>
						      </li>
						      <li class="name"><div>${user.name}</div><div class='email'>${user.email}</div></li>
						      <li class="team">${user.team}</li>
					  	    <li class="role">${user.role}</li>
					  	    <li class="user-status">
						  	    <div class="badge ${user.isWorking ? 'badge-success' : 'badge-error'}">
                      ${user.isWorking ? '근무 중' : '근무 중 아님'}
                    </div>
						      </li>
					      </ul>
              </li>      
            `,
                )
                .join('')
        }`;
        updateUserStatus();
      }
    };

    if (INIT_USER_INFO_VALUE) {
      renderSpecificUserInfo(INIT_USER_INFO_VALUE, ALL_USERS);
    } else {
      renderEmployeeList(ALL_USERS);
    }

    const getSearchedUsers = searchValue => {
      return ALL_USERS.filter(
        users =>
          users.employeeNumber?.toLowerCase().includes(searchValue) ||
          users.name?.toLowerCase().includes(searchValue) ||
          users.team?.toLowerCase().includes(searchValue) ||
          users.role?.toLowerCase().includes(searchValue) ||
          users.phone?.toLowerCase().includes(searchValue) ||
          users.email?.toLowerCase().includes(searchValue),
      );
    };

    if (INIT_SEARCH_VALUE) {
      const SEARCHED_USERS = getSearchedUsers(INIT_SEARCH_VALUE);
      renderEmployeeList(SEARCHED_USERS);
      SEARCH_INPUT.value = INIT_SEARCH_VALUE;
    } else {
      renderEmployeeList(ALL_USERS);
    }

    SEARCH_INPUT.addEventListener('keypress', event => {
      if (event.key === 'Enter') {
        const SEARCH_INPUT_VALUE = event.target.value.trim().toLowerCase();
        URL_PARAMS.set('search', SEARCH_INPUT_VALUE);
        history.pushState(null, null, `/admin?${URL_PARAMS.toString()}`);

        const SEARCHED_USERS = getSearchedUsers(SEARCH_INPUT_VALUE);

        renderEmployeeList(SEARCHED_USERS); // 필터된 결과를 렌더링하는 함수 호출
        clickUserCellEvent();
      }
    });

    const clickUserCellEvent = () => {
      const USER_CELLS = EMPLOYEE_DATA.querySelectorAll('.cell');
      // 직원 목록 중 상세 정보를 보고싶은 직원을 클릭시 직원 상세 페이지로 이동
      USER_CELLS.forEach(userCell => {
        userCell.addEventListener('click', e => {
          const USER_ID = e.currentTarget.getAttribute('data-id');

          URL_PARAMS.set('userinfo', USER_ID);
          history.pushState(null, null, `/admin?${URL_PARAMS.toString()}`);
          renderSpecificUserInfo(USER_ID, ALL_USERS);
        });
      });
    };

    clickUserCellEvent();

    MEDIA_QUERY_1230.addEventListener('change', updateUserStatus);
    MEDIA_QUERY_768.addEventListener('change', updateUserStatus);
    MEDIA_QUERY_480.addEventListener('change', updateUserStatus);
  } catch (error) {
    console.error('Fail to load Data:', error);
    const employeeData = CONTAINER.querySelector('#employee-data');
    if (employeeData) {
      employeeData.innerHTML = `<p>데이터를 불러오는데 실패했습니다.</p>`;
    }
  }

  // 특정 직원 정보 수정
  const renderEditModal = (userInfo, editModal) => {
    editModal.style.display = 'flex';
    editModal.innerHTML = `
        <div class="edit-profile-modal">
          <h2>${userInfo.name}님의 정보 수정</h2>
          <div class="modal-img-box">
            <img
              src=${userInfo.profileImg}
              alt="기본 프로필 이미지"
              class="profile-img-preview"
            />
          </div>
          <button class="btn btn-solid change-img-btn">변경</button>
          <div>사번</div>
          <input class="modal-user-employeeNumber" type="text" maxlength="6" value="${userInfo.employeeNumber}" placeholder="사번을 입력해주세요."/>
          <div class="error-message-div">
            <span class="modal-employeeNumber-error"></span>
          </div>
          <div>이름</div>
          <input class="modal-user-name" type="text" value="${userInfo.name}"/>
          <div class="error-message-div">
            <span class="modal-name-error"></span>
          </div>
          <div>소속</div>
          <select name="team" id="">
            <option disabled>선택</option>
            <option value="기획팀">기획팀</option>
            <option value="디자인팀">디자인팀</option>
            <option value="개발팀">개발팀</option>
            <option value="QA팀">QA팀</option>
            <option value="인사팀">인사팀</option>
            <option value="재무팀">재무팀</option>
            <option value="고객지원팀">고객지원팀</option>
            <option value="영업팀">영업팀</option>
          </select>
          <div>직급</div>
          <select name="role">
            <option disabled>선택</option>
            <option value="사원">사원</option>
            <option value="주임">주임</option>
            <option value="대리">대리</option>
            <option value="과장">과장</option>
            <option value="차장">차장</option>
            <option value="부장">부장</option>
            <option value="이사">이사</option>
            <option value="상무">상무</option>
            <option value="전무">전무</option>
            <option value="대표">대표</option>
          </select>
          <div>연락처</div>
          <input class="modal-user-phone" type="text" maxlength="11" value="${userInfo.phone}" placeholder="연락처를 입력해주세요."/>
          <div class="error-message-div">
            <span class="modal-phone-error"></span>
          </div>
          <div>E-mail</div>
          <input class="modal-user-email" type="text" value="${userInfo.email}" readonly/>
          <div class="error-message-div">
            <span class="modal-email-error"></span>
          </div>
          <div>비밀번호</div>
          <button class="btn btn-solid reset-password-btn">비밀번호 재설정 메일 발송</button>
          <div>주소</div>
          <div class="address-button-box">
            <button class="btn btn-solid search-address">주소찾기</button>
          </div>
          <input class="modal-user-address" type="text" placeholder="주소찾기 버튼을 클릭해주세요." value="${userInfo.address}" readonly />
          <div class="error-message-div">
            <span class="modal-address-error"></span>
          </div>
          <input class="modal-user-addressDetail" type="text" placeholder="상세주소를 입력해주세요." value="${userInfo.addressDetail}"/>
          <div class="error-message-div">
            <span class="modal-addressDetail-error"></span>
          </div>
          <div class="modal-button-box1">
            <button class="btn btn-solid confirm-edit-btn">수정</button>
            <button class="btn btn-outline cancel-edit-btn">취소</button>
          </div>
          <div class="modal-button-box2">
            <button class="btn btn-solid approve-user-btn" ${userInfo.isApproved ? 'style="display: none"' : ''}>가입 승인하기</button>
            ${userInfo.isDeleted ? '<button class="btn restore-user-btn">계정 복원하기</button>' : '<button class="btn delete-user-btn">계정 삭제하기</button>'}
          </div>
        </div>
    `;

    const TEAM_SELECT = editModal.querySelector('select[name="team"]');
    TEAM_SELECT.value = userInfo.team;

    const ROLE_SELECT = editModal.querySelector('select[name="role"]');
    ROLE_SELECT.value = userInfo.role;

    const USER_REF = doc(DB, 'users', userInfo.id);

    const handleAddressSearch = () => {
      const ADDRESS = document.querySelector('.modal-user-address');

      new daum.Postcode({
        oncomplete(data) {
          ADDRESS.value = data.roadAddress;
        },
      }).open();
    };

    const SEARCH_ADDRESS = editModal.querySelector('.search-address');
    SEARCH_ADDRESS.addEventListener('click', handleAddressSearch);

    const CANCEL_EDIT_BTN = editModal.querySelector('.cancel-edit-btn');

    // 버튼 클릭으로 모달 닫기
    CANCEL_EDIT_BTN.addEventListener('click', () => {
      editModal.style.display = 'none';
    });

    // 배경 클릭으로 모달 닫기
    editModal.addEventListener('click', e => {
      if (e.target === editModal) {
        editModal.style.display = 'none';
      }
    });

    const APPROVE_USER_BTN = editModal.querySelector('.approve-user-btn');

    APPROVE_USER_BTN.addEventListener('click', async () => {
      if (userInfo.isApproved) {
        return;
      }

      if (TEAM_SELECT.value === '' || ROLE_SELECT.value === '') {
        alert('가입 승인 전 소속과 직급을 입력해주세요.');
        return;
      }

      try {
        if (confirm('가입을 승인하시겠습니까?')) {
          await updateDoc(USER_REF, {
            team: TEAM_SELECT.value,
            role: ROLE_SELECT.value,
            isApproved: true,
          });
          alert('정상적으로 승인되었습니다');
        } else {
          alert('가입 승인이 취소되었습니다.');
        }

        window.location.reload();
      } catch (error) {
        console.error('Error updating user info:', error);
        alert('승인 중 오류가 발생했습니다.');
      }
    });

    if (!userInfo.isDeleted) {
      const DELETE_USER_BTN = editModal.querySelector('.delete-user-btn');

      DELETE_USER_BTN.addEventListener('click', async () => {
        try {
          if (confirm('정말로 이 계정을 삭제하시겠습니까?')) {
            await updateDoc(USER_REF, {
              isDeleted: true,
              deletedAt: new Date(),
            });
            alert('정상적으로 삭제되었습니다.');
          } else {
            alert('계정 삭제가 취소되었습니다.');
          }

          window.location.reload();
        } catch (error) {
          console.error('Error deleting user:', error);
          alert('삭제 중 오류가 발생했습니다.');
        }
      });
    } else {
      const RESTORE_USER_BTN = editModal.querySelector('.restore-user-btn');

      RESTORE_USER_BTN.addEventListener('click', async () => {
        try {
          if (confirm('정말로 이 계정을 복원하시겠습니까?')) {
            await updateDoc(USER_REF, {
              isDeleted: false,
              restoredAt: new Date(),
            });
            alert('정상적으로 복원되었습니다.');
          } else {
            alert('계정 복원이 취소되었습니다.');
          }

          window.location.reload();
        } catch (error) {
          console.error('Error restoring user:', error);
          alert('복원 중 오류가 발생했습니다.');
        }
      });
    }
    const RESET_PASSWORD_BTN = editModal.querySelector('.reset-password-btn');

    RESET_PASSWORD_BTN.addEventListener('click', async () => {
      try {
        await sendPasswordResetEmail(AUTH, userInfo.email);
        alert(
          '해당 직원의 이메일 주소로 비밀번호 재설정 메일이 발송되었습니다.',
        );
      } catch (error) {
        console.error('Error sending password reset email:', error);
        alert('비밀번호 재설정 메일 발송 중 오류가 발생했습니다.');
      }
    });

    const MODAL_PREVIEW_IMAGE = editModal.querySelector('.profile-img-preview');
    const MODAL_CHANGE_IMAGE_BTN = editModal.querySelector('.change-img-btn');
    const MODAL_CONFIRM_EDIT_BTN = editModal.querySelector('.confirm-edit-btn');
    let selectedImageFile = null;

    // 이미지 미리보기 처리
    const handleImagePreview = file => {
      const FILE_READER = new FileReader();
      FILE_READER.onload = e => {
        MODAL_PREVIEW_IMAGE.src = e.target.result;
      };
      FILE_READER.readAsDataURL(file);
    };

    // 이미지 임시 업로드 (이미지 프리뷰에만 반영)
    const uploadImageTemporarily = () => {
      const FILE_INPUT = document.createElement('input');
      FILE_INPUT.type = 'file';
      FILE_INPUT.accept = 'image/*';

      FILE_INPUT.addEventListener('change', e => {
        const FILE = e.target.files[0];
        if (!FILE) return;

        // 파일 크기 체크 (5MB 제한)
        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        if (FILE.size > MAX_FILE_SIZE) {
          alert('파일 크기는 5MB 이하여야 합니다.');
          return;
        }

        // 이미지 파일 타입 체크
        if (!FILE.type.startsWith('image/')) {
          alert('이미지 파일만 업로드 가능합니다.');
          return;
        }

        selectedImageFile = FILE;
        handleImagePreview(FILE);
      });

      MODAL_CHANGE_IMAGE_BTN.addEventListener('click', () => {
        FILE_INPUT.click();
      });
    };

    // 입력값 유효성 검사
    const validateInput = (value, type) => {
      switch (type) {
        case 'employeeNumber':
          return /^[0-9]{6,6}$/.test(value) ? '' : '6자의 숫자만 입력해주세요.';
        case 'name':
          return /^[가-힣a-zA-Z\s]+$/.test(value)
            ? ''
            : '한글, 영어 대/소문자, 공백만을 사용해주세요.';
        case 'phone':
          return /^[0-9]{11,11}$/.test(value)
            ? ''
            : '11자의 숫자만 입력해주세요.';
        case 'email':
          return /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-za-z0-9\-]+/.test(value)
            ? ''
            : '이메일 형식에 맞게 입력해 주세요.';
        case 'address':
          return value.trim() ? '' : '주소를 입력해주세요.';
        case 'addressDetail':
          return value.trim() ? '' : '상세 주소를 입력해주세요.';
        default:
          return '';
      }
    };

    // 에러 메시지 표시 함수
    const showError = (editModal, fieldName, message) => {
      const ERROR_SPAN = editModal.querySelector(`.modal-${fieldName}-error`);
      if (ERROR_SPAN) {
        ERROR_SPAN.textContent = message;
      }
    };

    // 모든 에러 메시지 초기화
    const clearErrors = editModal => {
      const ERROR_SPANS = editModal.querySelectorAll('[class*="-error"]');
      ERROR_SPANS.forEach(span => (span.textContent = ''));
    };

    // input 필드에 실시간 유효성 검사 추가
    const addInputValidation = editModal => {
      const FORM_INPUTS = {
        employeeNumber: editModal.querySelector('.modal-user-employeeNumber'),
        name: editModal.querySelector('.modal-user-name'),
        phone: editModal.querySelector('.modal-user-phone'),
        email: editModal.querySelector('.modal-user-email'),
        address: editModal.querySelector('.modal-user-address'),
        addressDetail: editModal.querySelector('.modal-user-addressDetail'),
      };

      Object.entries(FORM_INPUTS).forEach(([fieldName, input]) => {
        if (input) {
          input.addEventListener('input', () => {
            const errorMessage = validateInput(input.value, fieldName);
            showError(editModal, fieldName, errorMessage);
          });
        }
      });
    };

    // 정보 수정 처리
    const handleEditSubmit = async () => {
      try {
        const EMPLOYEE_NUMBER_INPUT = editModal.querySelector(
          '.modal-user-employeeNumber',
        );
        const NAME_INPUT = editModal.querySelector('.modal-user-name');
        const TEAM_SELECT = editModal.querySelector('select[name="team"]');
        const ROLE_SELECT = editModal.querySelector('select[name="role"]');
        const PHONE_INPUT = editModal.querySelector('.modal-user-phone');
        const EMAIL_INPUT = editModal.querySelector('.modal-user-email');
        const ADDRESS_INPUT = editModal.querySelector('.modal-user-address');
        const ADDRESS_DETAIL_INPUT = editModal.querySelector(
          '.modal-user-addressDetail',
        );

        // 모든 에러 메시지 초기화
        clearErrors(editModal);

        const validations = {
          employeeNumber: validateInput(
            EMPLOYEE_NUMBER_INPUT.value,
            'employeeNumber',
          ),
          name: validateInput(NAME_INPUT.value, 'name'),
          phone: validateInput(PHONE_INPUT.value, 'phone'),
          email: validateInput(EMAIL_INPUT.value, 'email'),
          address: validateInput(ADDRESS_INPUT.value, 'address'),
          addressDetail: validateInput(
            ADDRESS_DETAIL_INPUT.value,
            'addressDetail',
          ),
        };

        // 에러 메시지 표시
        let hasErrors = false;
        Object.entries(validations).forEach(([fieldName, errorMessage]) => {
          if (errorMessage) {
            showError(editModal, fieldName, errorMessage);
            hasErrors = true;
          }
        });

        // 유효성 검사 실패 시 함수 종료
        if (hasErrors) {
          return;
        }

        // 폼 데이터 수집
        const INPUT_DATA = {
          employeeNumber: EMPLOYEE_NUMBER_INPUT.value,
          name: NAME_INPUT.value,
          team: TEAM_SELECT.value,
          role: ROLE_SELECT.value,
          phone: PHONE_INPUT.value,
          email: EMAIL_INPUT.value,
          address: ADDRESS_INPUT.value,
          addressDetail: ADDRESS_DETAIL_INPUT.value,
        };

        // 이미지가 선택된 경우에만 Storage에 업로드
        let imageURL = userInfo.profileImg; // 기본값은 현재 이미지 URL
        if (selectedImageFile) {
          imageURL = await uploadFileToStorage(
            `profile-images/${Date.now()}_${selectedImageFile.name}`,
            selectedImageFile,
          );
        }

        // Firestore 업데이트 - 이미지 URL과 함께 모든 정보 저장
        const USER_REF = doc(DB, 'users', userInfo.id);
        await updateDoc(USER_REF, {
          ...INPUT_DATA,
          profileImg: imageURL,
          updatedAt: new Date(),
        });

        alert('정보가 성공적으로 수정되었습니다.');
        editModal.style.display = 'none';

        // 페이지 새로고침 또는 상태 업데이트
        window.location.reload();
      } catch (error) {
        console.error('Error updating user info:', error);
        alert('정보 수정 중 오류가 발생했습니다.');
      }
    };

    addInputValidation(editModal);

    // 이벤트 리스너 설정
    uploadImageTemporarily();
    MODAL_CONFIRM_EDIT_BTN.addEventListener('click', handleEditSubmit);
  };

  return CONTAINER;
};

export default employee;
