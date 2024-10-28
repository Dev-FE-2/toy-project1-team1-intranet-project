import { collection, getDocs } from 'firebase/firestore';
import { DB } from '../../firebaseConfig';

// 모든 유저 문서 가져오기
export const fetchCollectionData = async (collectionName) => {
  try {
    const DB_COLLECTION = collection(DB, collectionName);
    
    const DB_DOC = await getDocs(DB_COLLECTION);
    
    const DATA = DB_DOC.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return DATA
  } catch (error) {
    console.error('사용자 데이터 로드 실패:', error);
    throw error;
  }
};

// 사용 방법
// import fetchCollectionData from ...~~
// fetchCollectionData('컬렉션 이름')
// 현재 사용중인 컬렉션 이름 = users, notices, absences

// 사용 예시)
// const USERS = fetchCollectionData('users')