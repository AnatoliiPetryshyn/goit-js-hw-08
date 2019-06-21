'use strict';

import quizData from './quizData.js';

// получаем ссылки на форму и кнопки
const form = document.querySelector('form[data-form="test-form"]');
const submitButton = document.querySelector('button[data-action="submit"]');
const clearButton = document.querySelector('button[data-action="clearForm"]');

// создаем вопросы теста с вариантами ответов, затем добавляем их в форму
const buildList = (answers, idx) => {
  const ol = document.createElement('ol');
  ol.classList.add('section-list');

  answers.forEach((element, elementIdx) => {
    const li = document.createElement('li');
    li.classList.add('section-list__item');
    const label = document.createElement('label');
    const labelTextNode = document.createTextNode(element);
    const input = document.createElement('input');
    input.setAttribute('type', 'radio');
    input.setAttribute('name', `radio-${idx}`);
    input.setAttribute('value', `${elementIdx}`);
    input.setAttribute('id', `${idx}${elementIdx}`);
    input.classList.add('section-list__input');
    label.setAttribute('for', `${idx}${elementIdx}`);
    label.classList.add('section-list__label');

    label.appendChild(labelTextNode);
    li.append(input, label);
    ol.appendChild(li);
  });

  return ol;
};

const buildQuiz = quizData => {
  const formContent = document.createElement('div');
  formContent.classList.add('form-content');

  const title = document.createElement('h2');
  title.textContent = quizData.title;
  title.classList.add('form__title');

  formContent.appendChild(title);

  quizData.questions.forEach((item, idx) => {
    const section = document.createElement('section');
    section.classList.add('form__section');
    const h3 = document.createElement('h3');
    h3.textContent = item.question;

    section.append(h3, buildList(item.choices, idx));

    formContent.appendChild(section);
  });
  return formContent;
};

const quiz = buildQuiz(quizData);
form.insertBefore(quiz, submitButton);

// активация кнопки
const questionsLength = quizData.questions.length;

form.addEventListener('change', e => {
  const form = e.currentTarget;
  const formData = new FormData(form);

  let formDataLength = 0;

  formData.forEach(() => {
    formDataLength += 1;
  });

  if (formDataLength === questionsLength) {
    submitButton.disabled = false;
    submitButton.classList.remove('isDisabled');
  }
});

// получаем ответы пользователя и проверяем на правильность
form.addEventListener('submit', handleSubmit);

function handleSubmit(e) {
  e.preventDefault();

  const form = e.currentTarget;

  const validateAnswers = [];

  const rightAnswers = quizData.questions.map(item => {
    return item.answer;
  });

  const selectedAnswers = [];

  const formData = new FormData(form);

  formData.forEach(value => {
    selectedAnswers.push(Number(value));
  });

  selectedAnswers.forEach((answer, idx) => {
    validateAnswers.push({
      answer,
      passed: answer === rightAnswers[idx],
    });
  });

  // отображаем результат в интерфейсе
  let counter = 0;
  validateAnswers.forEach((item, idx) => {
    const input = form.querySelector(
      `input[name="radio-${idx}"][value="${item.answer}"]`,
    );
    if (item.passed) {
      input.nextElementSibling.classList.add('done');
      counter += 1;
    } else {
      input.nextElementSibling.classList.add('error');
    }
  });

  // считаем количество процентов
  const percentage = Math.round((counter * 100) / validateAnswers.length);

  // выводим результат в модальное окно
  const amountRightAnswers = document.querySelector('.js-modal__rightAnswers');
  amountRightAnswers.textContent = `Правильных ответов: ${counter}/${
    validateAnswers.length
  }`;
  const percentageRightAnswers = document.querySelector(
    '.js-modal__percentage',
  );
  percentageRightAnswers.textContent = `${percentage} %`;

  const modalMessage = document.querySelector('.js-modal__message');
  if (percentage > 80) {
    modalMessage.textContent = 'Поздравляю! Вы успешно прошли тест.';
    modalMessage.classList.add('modal__message--passed');
  } else {
    modalMessage.textContent =
      'Вы набрали меньше 80%! Тест провален, попробуйте еще раз.';
    modalMessage.classList.add('modal__message--failed');
  }
}

// модальное окно
const closeModalBtn = document.querySelector(
  'button[data-action="close-modal"]',
);
const backdrop = document.querySelector('.js-backdrop');

submitButton.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
backdrop.addEventListener('click', handleBackdropClick);

function openModal() {
  document.body.classList.add('show-modal');
  window.addEventListener('keydown', handleKeyPress);
}

function closeModal() {
  document.body.classList.remove('show-modal');
  window.removeEventListener('keydown', handleKeyPress);
}

function handleBackdropClick(event) {
  if (event.target !== event.currentTarget) {
    return;
  }

  closeModal();
}

function handleKeyPress(event) {
  if (event.code !== 'Escape') {
    return;
  }

  closeModal();
}

// очистка формы
clearButton.addEventListener('click', () => {
  form.reset();

  const modalMessage = document.querySelector('.js-modal__message');
  modalMessage.classList.remove('modal__message--passed');
  modalMessage.classList.remove('modal__message--failed');

  const label = document.querySelectorAll('label');
  label.forEach(item => {
    item.classList.remove('done');
    item.classList.remove('error');
  });

  submitButton.disabled = true;
  submitButton.classList.add('isDisabled');
});
