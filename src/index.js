import "./sass/style.scss";

const appForm = document.querySelector(".app__form");
const resultContainer = document.querySelector(".result");
const amountInput = appForm.querySelector(".form__input--amount");
const dateInput = appForm.querySelector(".form__input--date");
const currencyInput = appForm.querySelector(".form__input--currency");

const handleClick = e => {
  e.preventDefault();
  const amount = amountInput.value;
  const date = dateInput.value;
  const currency = currencyInput.value;
  getData(date, currency);
  calculate(amount);
  showResult();
};
const getData = (date, currency) => {
  return;
};
const calculate = amount => {
  return;
};
const showResult = () => {
  return;
};

appForm.addEventListener("submit", handleClick);
