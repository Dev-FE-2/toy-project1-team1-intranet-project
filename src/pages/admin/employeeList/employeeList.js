import { fetchCurrentUserData } from '../../../utils/fetchCurrentUserData';

const employeeList = async () => {
  const container = document.createElement('div');
  container.innerHTML = `
    <div>
      <h1>직원 목록</h1>
      <div id="employee-data">로딩 중...</div>
    </div>
  `;

  try {
    const userData = await fetchCurrentUserData();
    console.log(userData);
    /* 콘솔로그 결과
    address : "경기 수원시 권선구 경수대로 89-4, 1"
    createdAt : _Timestamp {seconds: 1729742926, nanoseconds: 416000000}
    email : "b@dev.camp"
    employeeNumber : "413891"
    isAdmin : true
    isApproved : true
    name : "박사원"
    phone : "01000000000"
    */

    const employeeData = container.querySelector('#employee-data');
    if (employeeData) {
      employeeData.innerHTML = `
        <div>
          <p>이름: ${userData.name}</p>
          <p>이메일: ${userData.email}</p>
        </div>
      `;
    }
  } catch (error) {
    console.log('유저 데이터 로드 실패:', error);
    if (error.message === '인증되지 않은 사용자입니다.') {
      window.location.href = '/login';
    }
  }

  return container;
};

export default employeeList;
