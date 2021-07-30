import "./sass/style.scss";

const API_URL = "https://api.nbp.pl/api/exchangerates";

const appForm = document.querySelector(".app__form");
const resultContainer = document.querySelector(".result");
const amountInput = appForm.querySelector(".form__input--amount");
const dateInput = appForm.querySelector(".form__input--date");
const currencyInput = appForm.querySelector(".form__input--currency");

const possibleRates = [];

const handleSubmit = e => {
  e.preventDefault();
  const amount = amountInput.value;
  const date = dateInput.value;
  const currency = currencyInput.value.toUpperCase();

  resultContainer.innerHTML = "";

  const invalidFields = [
    { fn: checkAmountErrors, arg: amount, inp: amountInput },
    { fn: checkDateErrors, arg: date, inp: dateInput },
    { fn: checkCurrencyErrors, arg: currency, inp: currencyInput },
  ].map(checkErrors);

  if (invalidFields.includes(true)) {
    document.body.classList.add("error");
    return;
  } else {
    document.body.classList.remove("error");
  }

  const formatedAPIUrl = formatAPIUrl(date, currency);

  showLoader();
  fetch(formatedAPIUrl)
    .then(res => res.json())
    .then(({ code, rates }) => {
      const {
        no: table,
        effectiveDate: date,
        mid: exchangeRate,
      } = rates.sort(rate => rate.effectiveDate).reverse()[0];
      return { code, table, date, exchangeRate };
    })
    .then(data => showResult(amount, data))
    .catch(showError);
};

const checkAmountErrors = amount => {
  let errors = false;

  if (!amount) {
    addMessage("wprowadź kwotę");
    errors = true;
  } else if (Number.isNaN(Number(amount))) {
    addMessage("kwota musi być liczbą");
    errors = true;
  } else if (Number(amount) <= 0) {
    addMessage("kwota musi być większa od zera");
    errors = true;
  }

  return errors;
};

const checkDateErrors = date => {
  let errors = false;

  if (!date) {
    addMessage("wprowadź datę");
    errors = true;
  } else if (!date.match(/\d{4}-\d{2}-\d{2}/)) {
    addMessage("zły format daty - wprowadź: RRRR-MM-DD");
    errors = true;
  } else if (
    new Date(date).setHours(0, 0, 0, 0) > new Date().setHours(0, 0, 0, 0)
  ) {
    addMessage("data nie może być z przyszłości");
    errors = true;
  }

  return errors;
};

const checkCurrencyErrors = currency => {
  let errors = false;

  if (!currency) {
    addMessage("wprowadź walutę");
    errors = true;
  } else if (!currency.match(/^\w{3}$/i)) {
    addMessage("zły format waluty - musi zawierać 3 znaki");
    errors = true;
  } else if (!possibleRates.includes(currency)) {
    addMessage(
      `nie znaleziono takiej waluty ${currency}, upewnij się, że jest poprawna`
    );
    errors = true;
  }
  return errors;
};

const checkErrors = ({ arg, inp, fn }) => {
  const hasErrors = fn(arg);
  hasErrors
    ? inp.classList.add("input__error")
    : inp.classList.remove("input__error");
  return hasErrors;
};

const formatAPIUrl = (date, currency) => {
  const startingDate = new Date(date);
  const endingDate = new Date(date);
  previousDate(endingDate, 1);
  previousDate(startingDate, 8);
  const formatStartingDate = formatDate(startingDate);
  const formatEndingDate = formatDate(endingDate);
  return `${API_URL}/rates/A/${currency}/${formatStartingDate}/${formatEndingDate}`;
};

const previousDate = (date, days) => date.setDate(date.getDate() - days);
const formatDate = date => date.toISOString().split("T")[0];

const showError = error => {
  resultContainer.innerHTML = "";
  addMessage(`Wystąpił błąd: ${error}`);
};

const addMessage = messageText => {
  const message = document.createElement("p");
  message.classList.add("result__message");
  message.innerText = messageText;
  resultContainer.appendChild(message);
};

const showResult = (amount, { code, table, date, exchangeRate }) => {
  const convertedAmount = +(Number(amount) * Number(exchangeRate)).toFixed(4);

  resultContainer.innerHTML = "";
  addMessage(`1 ${code} = ${exchangeRate} PLN`);
  addMessage(`TAB ${table} z dnia: ${date}`);
  addMessage(`${amount} ${code} = ${convertedAmount} PLN`);
};

const showLoader = () => {
  const loader = document.createElement("div");
  loader.classList.add("result__loader", "loader");

  resultContainer.innerHTML = "";
  resultContainer.appendChild(loader);
};

fetch(`${API_URL}/tables/a/`)
  .then(res => res.json())
  .then(data =>
    data[0].rates.forEach(rate => possibleRates.push(rate.code.toUpperCase()))
  )
  .then(appForm.addEventListener("submit", handleSubmit))
  .catch(showError);

dateInput.setAttribute("max", formatDate(new Date()));
