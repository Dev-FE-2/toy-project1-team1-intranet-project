const dimmed = document.getElementById('dimmed');
// const popupButtons = document.querySelectorAll('[data-popup]');
const closePopupButtons = document.querySelectorAll('.close-popup-btn');

// popupButtons.forEach(button => {
//   button.addEventListener('click', (e) => {
//     const popupId = e.currentTarget.getAttribute('data-popup');
//     openPopup(popupId);
//   });
// });

// 단순 닫기 동작
closePopupButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    const popupId = e.currentTarget.closest('.layer-popup').getAttribute('id');
    closePopup(popupId);
  });
});

const openPopup = (popupId) => {
  const popup = document.getElementById(popupId);
  popup.classList.add('is-active');
  dimmed.classList.add('is-active');
  popup.setAttribute('aria-hidden', 'false');

  document.body.style.overflow = 'hidden';
};

const closePopup = (popupId) => {
  const popup = document.getElementById(popupId);

  popup.classList.remove('is-active');
  dimmed.classList.remove('is-active');
  popup.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

const today = new Date();