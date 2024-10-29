import { collection, getDocs } from 'firebase/firestore';
import { DB } from '../../firebaseConfig';

// 모든 유저 문서 가져오기
export const fetchAllUsers = async () => {
  try {
    const USERS_COLLECTION = collection(DB, 'users');
    
    const USERS_DOC = await getDocs(USERS_COLLECTION);
    
    const USERS = USERS_DOC.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return USERS;
  } catch (error) {
    console.error('사용자 데이터 로드 실패:', error);
    throw error;
  }
};