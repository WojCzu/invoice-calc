import "./sass/style.scss";

const API_URL = "http://api.nbp.pl/api/exchangerates/rates";

const appForm = document.querySelector(".app__form");
const resultContainer = document.querySelector(".result");
const amountInput = appForm.querySelector(".form__input--amount");
const dateInput = appForm.querySelector(".form__input--date");
const currencyInput = appForm.querySelector(".form__input--currency");

const handleSubmit = e => {
  e.preventDefault();
  const amount = amountInput.value;
  const date = dateInput.value;
  const currency = currencyInput.value;
  getData(date, currency).then(data => showResult(amount, data));
};

const getData = (date, currency) => {
  const startingDate = new Date(date);
  const endingDate = new Date(date);
  previousDate(endingDate, 1);
  previousDate(startingDate, 8);
  const formatStartingDate = formatDate(startingDate);
  const formatEndingDate = formatDate(endingDate);
  const api = `${API_URL}/A/${currency}/${formatStartingDate}/${formatEndingDate}`;

  return fetch(api)
    .then(res => res.json())
    .then(({ code, rates }) => {
      const {
        no: table,
        effectiveDate: date,
        mid: exchangeRate,
      } = rates.sort(rate => rate.effectiveDate).reverse()[0];
      return { code, table, date, exchangeRate };
    })
    .catch(showError);
};
const previousDate = (date, days) => date.setDate(date.getDate() - days);
const formatDate = date => date.toISOString().split("T")[0];

const showError = error => {
  const errorMessage = document.createElement("p");
  errorMessage.classList.add("result__message");
  errorMessage.innerText = `Wystąpił błąd: ${error}`;
  resultContainer.innerHTML = "";
  resultContainer.appendChild(errorMessage);
};

const showResult = (amount, { code, table, date, exchangeRate }) => {
  const convertedAmount = +(Number(amount) * Number(exchangeRate)).toFixed(4);
  const fragment = document.createDocumentFragment();

  const rateMessage = document.createElement("p");
  rateMessage.innerText = `1 ${code} = ${exchangeRate} PLN`;

  const tableMessage = document.createElement("p");
  tableMessage.innerText = `TAB ${table} z dnia: ${date}`;

  const exchangeRateMessage = document.createElement("p");
  exchangeRateMessage.innerText = `${amount} ${code} = ${convertedAmount} PLN`;

  [rateMessage, tableMessage, exchangeRateMessage].forEach(element => {
    element.classList.add("result__message");
    fragment.appendChild(element);
  });

  resultContainer.innerHTML = "";
  resultContainer.appendChild(fragment);
};

appForm.addEventListener("submit", handleSubmit);
