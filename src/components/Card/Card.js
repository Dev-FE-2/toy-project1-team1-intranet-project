import './card.css';

/**
 * 갤러리 게시판 카드
 * @param {Object} options - 옵션 객체
 * @param {string[]} [options.classList] - 클래스 목록
 * @param {string} options.id - 아이디
 * @param {string} options.title - 제목 (필수)
 * @param {string} options.content - 내용 (필수)
 * @param {string} options.thumb - 썸네일
 * @param {string} options.writer - 글쓴이
 * @param {string} options.createat - 작성날짜
 */

export default function createButton({
  classList = [],
  id,
  title,
  content,
  thumb,
  writer,
  createat
}){
  
  // 카드 마크업
  const render = () => `
    <div id="${id}" class="postcard ${classList ? classList.join(' ') : ''}">
      <a href="#none">
        ${thumb ? `<img class="postcard-img" src="${thumb}" alt="Post Image" />` : ''}
        <div class="contents">
          <h2 class="contents__title">${title}</h2>
          <p class="contents__content">${content}</p>
          <div class="contents__information">
            ${writer ? `<span class="information-author">${writer}</span>` : ''}
            ${createat ? `<span class="information-date">${createat}</span>` : ''}
          </div>
        </div>
      </a>
    </div>
  `;

  return {
    render
  }
}