'use strict';

import quizData from './quizData.js';

// получаем ссылки на форму и кнопку
const form = document.querySelector('form[data-form="test"]');
const submitButton = document.querySelector('button[data-action="submit"]');
const clearButton = document.querySelector('button[data-action="clearForm"]');

// создаем вопросы теста с вариантами ответов, затем добавляем их в форму
const buildList = (answers, idx) => {
  const ol = document.createElement('ol');
  answers.forEach((element, elementIdx) => {
    const li = document.createElement('li');
    const label = document.createElement('label');
    const labelTextNode = document.createTextNode(element);
    const input = document.createElement('input');
    input.setAttribute('type', 'radio');
    input.setAttribute('name', `radio-${idx}`);
    input.setAttribute('value', `${elementIdx}`);
    label.setAttribute(`data-radio-${idx}`, `${elementIdx}`);

    label.append(input, labelTextNode);
    li.appendChild(label);
    ol.appendChild(li);
  });
  return ol;
};

const buildQuiz = quizData => {
  const formContent = document.createElement('div');
  formContent.classList.add('form-content');

  const title = document.createElement('h2');
  title.textContent = quizData.title;

  formContent.appendChild(title);

  quizData.questions.forEach((item, idx) => {
    const section = document.createElement('section');
    const h3 = document.createElement('h3');
    h3.textContent = item.question;

    section.append(h3, buildList(item.choices, idx));

    formContent.appendChild(section);
  });
  return formContent;
};

const quiz = buildQuiz(quizData);
form.insertBefore(quiz, submitButton);

// получаем ответы пользователя и проверяем на правильность
form.addEventListener('submit', handleSubmitWithFormData);

function handleSubmitWithFormData(e) {
  e.preventDefault();

  const validateAnswers = [];

  const rightAnswers = quizData.questions.map(item => {
    return item.answer;
  });

  const selectedAnswers = [];

  const formData = new FormData(event.currentTarget);

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
    if (item.passed) {
      document
        .querySelector(`label[data-radio-${idx}="${item.answer}"`)
        .classList.add('done');
      counter += 1;
    } else {
      document
        .querySelector(`label[data-radio-${idx}="${item.answer}"`)
        .classList.add('error');
    }
  });

  const percentage = Math.round((counter * 100) / validateAnswers.length);

  const amountRightAnswers = document.querySelector('.js-modal__rightAnswers');
  amountRightAnswers.textContent = `${counter}/${validateAnswers.length}`;
  const percentageRightAnswers = document.querySelector(
    '.js-modal__percentage',
  );
  percentageRightAnswers.textContent = `${percentage} %`;
}

// очистка формы
clearButton.addEventListener('click', () => {
  form.reset();
  const label = document.querySelectorAll('label');
  label.forEach(item => {
    item.classList.remove('done');
    item.classList.remove('error');
  });
});
