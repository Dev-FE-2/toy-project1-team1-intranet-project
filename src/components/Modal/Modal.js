import './modal.css';

/**
 * 모달 생성기
 * @classList 클래스
 * @id (필수)아이디
 * @title 타이틀
 * @content 본문
 * @buttons 버튼(확인, 취소 등)
 */
export default class Modal{
  constructor({
    classList,
    id,
    title,
    content,
    buttons
  }) {

    this.classList = classList;
    this.id = id;
    this.title = title;
    this.content = content;
    this.buttons = buttons;
  }
  
  open() {
    const popup = document.getElementById(this.id);
    popup.classList.add('is-active');
    document.getElementById('dimmed').classList.add('is-active');
    popup.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  // close() {
  //   const popup = document.getElementById(this.id);
  //   popup.classList.remove('is-active');
  //   dimmed.classList.remove('is-active');
  //   popup.setAttribute('aria-hidden', 'true');
  //   document.body.style.overflow = '';
  // }

  render() {
    return `
      <div class="dimmed" id="dimmed"></div>
      <div
        class="layer-popup ${this.classList ? this.classList : ''}"
        id="${this.id ? this.id : ''}"
      >
        ${this.title ? `<h2 class="title">${this.title}</h2>` : ''}
        ${this.content}
        <div class="btn-box">
          ${this.buttons}
        </div>
      </div>
    `;
  }
}