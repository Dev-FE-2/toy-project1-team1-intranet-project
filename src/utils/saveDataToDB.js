import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { DB, STORAGE } from '../../firebaseConfig';

// Firestore에 데이터 저장하기
export const saveDataToDB = async (collectionName, data) => {
  try {
    const DB_COLLECTION = collection(DB, collectionName);

    const docRef = await addDoc(DB_COLLECTION, data);

    return docRef.id;
  } catch (error) {
    console.error('데이터 저장 실패:', error);
    throw error;
  }
};

// Firebase Storage에 파일 업로드하기
export const uploadFileToStorage = async (filePath, file) => {
  try {
    const storageRef = ref(STORAGE, filePath);
    const uploadSnapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(uploadSnapshot.ref);
  } catch (error) {
    console.error('파일 업로드 실패:', error);
    throw error;
  }
};
// 사용 방법
// import saveDataToDB from ...~~
// saveDataToDB('컬렉션 이름', 데이터 객체)
// 예: saveDataToDB('notices', { image:'https://img.link' title: '공지사항 제목', contents: '공지사항 본문' })
