import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, getDoc, getDocs, collection } from 'firebase/firestore';
import { DB, AUTH } from '../../../../firebaseConfig';

const PAGE_TYPES = {
  login: 'login',
  signup: 'signup',
};

const updateURL = pageType => {
  const url = new URL(window.location);
  url.searchParams.set('page', pageType);
  window.history.pushState({ pageType }, '', url);
};

const renderPage = pageType => {
  switch (pageType) {
    case PAGE_TYPES.signup:
      renderSignupForm();
      break;
    case PAGE_TYPES.login:
    default:
      renderLoginForm();
  }
};

const navigateTo = pageType => {
  updateURL(pageType);
  renderPage(pageType);
};

const addNavigationHandler = (selector, pageType) => {
  document
    .querySelector(selector)
    .addEventListener('click', () => navigateTo(pageType));
};

const addEnterKeyHandler = (selectors, actionFunction) => {
  document.querySelectorAll(selectors).forEach(selector =>
    selector.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        actionFunction();
      }
    }),
  );
};

// ========================== 로그인 ==========================
// 로그인 폼 렌더링 함수
const renderLoginForm = () => {
  APP_DIV.innerHTML = `
  <div class='wrapper'>
   <div class='join-box'>
      <h2>로그인</h2>
      <div class='instruction'>
      <p>아직 회원가입하지 않으셨나요?</p>
      <button class="go-to-signup nav-auth-button">회원가입하기</button>
      </div>
      <div class="login-form">
        <input type="text" class="login-email" placeholder="이메일" >
        <input type="password" class="login-password" placeholder="비밀번호" >
        <span class='password-error'></span>
      </div>
      <span class="error-message"></span>
      <button class='btn btn-solid login-button'>로그인</button>
    </div>
  </div>
  `;

  document
    .querySelector('.login-button')
    .addEventListener('click', handleLogin);

  addNavigationHandler('.go-to-signup', PAGE_TYPES.signup);
  addEnterKeyHandler('.login-form input', handleLogin);
};

// 로그인 핸들러
const handleLogin = async () => {
  const EMAIL = document.querySelector('.login-email').value;
  const PASSWORD = document.querySelector('.login-password').value;
  const ERROR_MESSAGE = document.querySelector('.error-message');
  const LOGIN_BUTTON = document.querySelector('.login-button');

  try {
    LOGIN_BUTTON.disabled = true;
    ERROR_MESSAGE.textContent = '';

    // Firebase Authentication 로그인
    const USER_CREDENTIAL = await signInWithEmailAndPassword(
      AUTH,
      EMAIL,
      PASSWORD,
    );
    const USER = USER_CREDENTIAL.user;

    // Firestore에서 사용자 정보 가져오기
    const USER_DOC = await getDoc(doc(DB, 'users', USER.uid));

    if (USER_DOC.exists()) {
      const USER_DATA = USER_DOC.data();

      if (!USER_DATA.isApproved || USER_DATA.isDeleted) {
        AUTH.signOut(); // 로그인 실패시 로그아웃 처리
        throw new Error(
          USER_DATA.isDeleted ? 'deleted account' : 'waiting for approval',
        );
      } else {
        window.location.href = USER_DATA.isAdmin ? '/admin' : '/';
      }
    }
  } catch (error) {
    handleErrorMessage(error, ERROR_MESSAGE);
  } finally {
    LOGIN_BUTTON.disabled = false;
  }
};

// ========================== 회원가입 ==========================

const getSignupInput = () => ({
  email: document.querySelector('.signup-email'),
  password: document.querySelector('.signup-password'),
  passwordCheck: document.querySelector('.signup-password-check'),
  name: document.querySelector('.signup-name'),
  employeeNumber: document.querySelector('.signup-employee-number'),
  phone: document.querySelector('.signup-phone'),
  address: document.querySelector('.signup-address'),
  addressDetail: document.querySelector('.signup-address-detail'),
});

// 유효성 검사 폼 함수
const validateInput = (input, validationFunction, errorSpan, errorMessage) => {
  const VALID_INPUT = validationFunction(input);
  const ERROR_SPAN = document.querySelector(errorSpan);
  if (VALID_INPUT) {
    ERROR_SPAN.textContent = '';
  } else {
    ERROR_SPAN.textContent = errorMessage;
  }
  return VALID_INPUT;
};

// 회원가입 폼 렌더링 함수
// 📌 기능별로 함수를 쪼개고 호출해서 재사용하는 식으로 리팩토링 예정
const renderSignupForm = () => {
  APP_DIV.innerHTML = `
  <div class='wrapper'>
    <div class='join-box'>
      <h2>회원가입</h2>
      <div class='instruction'>
      <p>이미 회원가입하셨나요?</p>
      <button class="go-to-login nav-auth-button">로그인하기</button>
      </div>

      <div class="signup-form">
        <input type="text" class="signup-email" placeholder="이메일" />
        <span class='email-error'></span>
        <input type="password" class="signup-password" placeholder="비밀번호" />
        <span class='password-error'></span>
        <input type="password" class="signup-password-check" placeholder="비밀번호 확인" />
        <span class='password-check-error'></span>
        <input type="text" class="signup-name" placeholder="이름" />
        <span class='name-error'></span>
        <input type="text" class="signup-employee-number" maxlength='6' placeholder="사번" />
        <span class='employee-number-error'></span>
        <input type="text" class="signup-phone" maxlength='11' placeholder="연락처" />
        <span class='phone-error'></span>
        <div class='address-btn-box'>
          <button class='btn btn-solid search-address'>주소검색</button>
          <p>< 주소검색 버튼을 클릭해주세요</p>
        </div>
        <input type="text" class="signup-address" placeholder="주소" readOnly />
        <span class='address-error'></span>
        <input type='text' class='signup-address-detail' placeholder='상세 주소를 입력해 주세요' />
        <span class='address-detail-error'></span>
      </div>
      <span class="error-message"></span>
      <button class='btn btn-solid signup-button'>회원가입</button>
    </div>
  </div>
  `;

  addNavigationHandler('.go-to-login', PAGE_TYPES.login);

  const handleAddressSearch = () => {
    const ADDRESS = document.querySelector('.signup-address');

    new daum.Postcode({
      oncomplete(data) {
        ADDRESS.value = data.roadAddress;
      },
    }).open();
  };

  document
    .querySelector('.search-address')
    .addEventListener('click', handleAddressSearch);

  const SIGNUP_INPUT = getSignupInput();

  // 유효성 검사 폼 함수에 전달
  const validateEmail = () =>
    validateInput(
      SIGNUP_INPUT.email,
      input =>
        /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-za-z0-9\-]+/.test(input.value),
      '.email-error',
      '이메일 형식에 맞게 입력해 주세요.',
    );
  const validatePassword = () =>
    validateInput(
      SIGNUP_INPUT.password,
      input => /^(?=.*[a-z])(?=.*\d)[a-z0-9]{6,15}$/.test(input.value),
      '.password-error',
      '6~15자의 영문 소문자, 숫자만을 사용해 주세요.',
    );
  const validatePasswordCheck = () =>
    validateInput(
      SIGNUP_INPUT.passwordCheck,
      input => input.value === SIGNUP_INPUT.password.value,
      '.password-check-error',
      '비밀번호가 일치하지 않습니다',
    );
  const validateName = () =>
    validateInput(
      SIGNUP_INPUT.name,
      input => /^[가-힣a-zA-Z\s]+$/.test(input.value),
      '.name-error',
      '한글, 영어 대/소문자, 공백만을 사용해 주세요.',
    );
  const validateEmployeeNumber = () =>
    validateInput(
      SIGNUP_INPUT.employeeNumber,
      input => /^[0-9]{6,6}$/.test(input.value),
      '.employee-number-error',
      '6자의 숫자만 입력해 주세요.',
    );
  const validatePhone = () =>
    validateInput(
      SIGNUP_INPUT.phone,
      input => /^[0-9]{11,11}$/.test(input.value),
      '.phone-error',
      '11자의 숫자만 입력해 주세요.',
    );
  const validateAddress = () =>
    validateInput(
      SIGNUP_INPUT.address,
      input => input.value.trim() !== '',
      '.address-error',
      '주소 검색 버튼을 눌러 주소를 입력해 주세요.',
    );
  const validateAddressDetail = () =>
    validateInput(
      SIGNUP_INPUT.addressDetail,
      input => input.value.trim() !== '',
      '.address-detail-error',
      '상세 주소를 입력해 주세요.',
    );

  document.querySelector('.signup-button').addEventListener('click', () =>
    handleSignup(SIGNUP_INPUT, {
      validateEmail,
      validatePassword,
      validatePasswordCheck,
      validateName,
      validateEmployeeNumber,
      validatePhone,
      validateAddress,
      validateAddressDetail,
    }),
  );

  Object.entries(SIGNUP_INPUT).forEach(([key, input]) => {
    input.addEventListener('input', () => {
      switch (key) {
        case 'email':
          validateEmail();
          break;
        case 'password':
          validatePassword();
          validatePasswordCheck();
          break;
        case 'passwordCheck':
          validatePasswordCheck();
          break;
        case 'name':
          validateName();
          break;
        case 'employeeNumber':
          validateEmployeeNumber();
          break;
        case 'phone':
          validatePhone();
          break;
        case 'address':
          validateAddress();
          break;
        case 'addressDetail':
          validateAddressDetail();
          break;
        default:
          break;
      }
    });
  });
};

// 회원가입 핸들러
const handleSignup = async (SIGNUP_INPUT, inputValidators) => {
  const SIGNUP_BUTTON = document.querySelector('.signup-button');

  const IS_VALID = {
    email: inputValidators.validateEmail(),
    password: inputValidators.validatePassword(),
    passwordCheck: inputValidators.validatePasswordCheck(),
    name: inputValidators.validateName(),
    employeeNumber: inputValidators.validateEmployeeNumber(),
    phone: inputValidators.validatePhone(),
    address: inputValidators.validateAddress(),
    addressDetail: inputValidators.validateAddressDetail(),
  };

  const ERROR_MESSAGE = document.querySelector('.error-message');

  const USERS_DOC = await getDocs(collection(DB, 'users'));
  const IS_EMPLOYEE_NUMBER_DUPLICATE = USERS_DOC.docs.some(
    doc => doc.data().employeeNumber === SIGNUP_INPUT.employeeNumber.value,
  );

  try {
    SIGNUP_BUTTON.disabled = true;
    ERROR_MESSAGE.textContent = '';

    if (!Object.values(IS_VALID).every(Boolean)) {
      throw new Error('validation failed');
    }

    if (IS_EMPLOYEE_NUMBER_DUPLICATE) {
      throw new Error('employee number in use');
    }

    // Firebase Authentication 회원가입
    const USER_CREDENTIAL = await createUserWithEmailAndPassword(
      AUTH,
      SIGNUP_INPUT.email.value,
      SIGNUP_INPUT.password.value,
    );
    const USER = USER_CREDENTIAL.user;

    // Firestore에 유저 데이터 저장
    await setDoc(doc(DB, 'users', USER.uid), {
      email: SIGNUP_INPUT.email.value,
      name: SIGNUP_INPUT.name.value,
      employeeNumber: SIGNUP_INPUT.employeeNumber.value,
      phone: SIGNUP_INPUT.phone.value,
      address: SIGNUP_INPUT.address.value,
      addressDetail: SIGNUP_INPUT.addressDetail.value,
      role: '',
      team: '',
      profileImg: 'https://www.studiopeople.kr/common/img/default_profile.png',
      isApproved: false,
      isAdmin: false,
      isWorking: false,
      createdAt: new Date(),
    });

    navigateTo(PAGE_TYPES.login); // 로그인 페이지 렌더
    await AUTH.signOut(); // 관리자 승인 전이므로 즉시 로그아웃 처리
  } catch (error) {
    handleErrorMessage(error, ERROR_MESSAGE);
  } finally {
    SIGNUP_BUTTON.disabled = false;
  }
};

const handleErrorMessage = (error, errorMessageElement) => {
  const MESSAGES = {
    // 로그인 에러 메시지
    'auth/invalid-email': '이메일 형식에 맞게 입력해주세요.',
    'auth/missing-password': '비밀번호를 입력해 주세요.',
    'auth/invalid-credential':
      '잘못된 이메일 혹은 비밀번호입니다. 확인 후 다시 입력해주세요.',
    'waiting for approval': '로그인 실패: 관리자 승인 대기중입니다.',
    'deleted account': '로그인 실패: 삭제된 계정입니다.',

    // 회원가입 에러 메시지
    'auth/email-already-in-use': '이미 존재하는 이메일입니다.',
    'validation failed': '모든 입력값을 올바르게 입력해 주세요.',
    'employee number in use':
      '현재 사용중인 사번입니다. 확인 후 다시 입력해주세요.',
  };
  errorMessageElement.textContent =
    MESSAGES[error.code] ||
    MESSAGES[error.message] ||
    '잠시 후 다시 시도해 주세요.';
};

const initJoinPage = (container, pageType) => {
  if (!container) {
    console.error('NO CONTAINER');
    return;
  }

  window.APP_DIV = container;

  const URL_PARAMS = new URLSearchParams(window.location.search);
  const INIT_PAGE = URL_PARAMS.get('page') || PAGE_TYPES.login;
  renderPage(INIT_PAGE);

  window.addEventListener('popstate', e => {
    const PAGE_TYPE = e.state?.pageType || PAGE_TYPES.login;
    renderPage(PAGE_TYPE);
  });
};

export default initJoinPage;
