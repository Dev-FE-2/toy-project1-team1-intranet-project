import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from '../../firebaseConfig'; // Firebase 설정 import

// Firebase 앱 초기화 및 Firestore 인스턴스 생성
const app = initializeApp(firebaseConfig);
const DB = getFirestore(app);

// 모든 부재 문서 가져오기
export const fetchAllAbsences = async () => {
  try {
    const ABSENCES_COLLECTION = collection(DB, 'absences');
    const ABSENCES_DOC = await getDocs(ABSENCES_COLLECTION);

    const ABSENCES = ABSENCES_DOC.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return ABSENCES;
  } catch (error) {
    console.error('부재 데이터 로드 실패:', error);
    throw error;
  }
};
