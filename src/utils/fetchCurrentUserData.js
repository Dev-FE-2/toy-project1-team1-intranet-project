import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { DB, AUTH } from '../../firebaseConfig';

// 현재 로그인한 유저 데이터 가져오기 함수
export const fetchCurrentUserData = async () => {
  const user = await new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(AUTH, user => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        reject(new Error('인증되지 않은 사용자입니다.'));
      }
    });
  });

  // 인증된 사용자의 데이터 가져오기
  const userDoc = await getDoc(doc(DB, 'users', user.uid));
  if (userDoc.exists()) {
    return userDoc.data();
  } else {
    throw new Error('유저 데이터가 존재하지 않습니다.');
  }
};
