import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { DB, AUTH } from '../../firebaseConfig';

/**
 * 현재 로그인한 유저 데이터 가져오기 함수
 * @example const USER_DATA = await fetchCurrentUserData();
 */
export const fetchCurrentUserData = async () => {
  const USER = await new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(AUTH, USER => {
      unsubscribe();
      if (USER) {
        resolve(USER);
      } else {
        reject(new Error('인증되지 않은 사용자입니다.'));
      }
    });
  });

  // 인증된 사용자의 데이터 가져오기
  const USER_DOC = await getDoc(doc(DB, 'users', USER.uid));
  if (USER_DOC.exists()) {
    return { ...USER_DOC.data(), uid: USER.uid }; // UID 포함해서 반환
  } else {
    throw new Error('유저 데이터가 존재하지 않습니다.');
  }
};
