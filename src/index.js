import "./sass/style.scss";
import dayjs from "dayjs";

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

  showLoader();
  fetch(getAPIUrl(date, currency))
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
    addMessage("Wprowadź kwotę.");
    errors = true;
  } else if (Number.isNaN(Number(amount))) {
    addMessage("Kwota musi być liczbą.");
    errors = true;
  } else if (Number(amount) <= 0) {
    addMessage("Kwota musi być większa od zera.");
    errors = true;
  }

  return errors;
};

const checkDateErrors = date => {
  let errors = false;
  if (!date) {
    addMessage("Wprowadź datę.");
    errors = true;
  } else if (!date.match(/\d{4}-\d{2}-\d{2}/)) {
    addMessage("Zły format daty. Upewnij się, że jest w formacie: RRRR-MM-DD.");
    errors = true;
  } else if (dayjs().diff(dayjs(date)) < 0) {
    addMessage("Data nie może być z przyszłości.");
    errors = true;
  }

  return errors;
};

const checkCurrencyErrors = currency => {
  let errors = false;

  if (!currency) {
    addMessage("Wprowadź walutę.");
    errors = true;
  } else if (!currency.match(/^\w{3}$/i)) {
    addMessage("Zły format waluty - musi zawierać 3 znaki.");
    errors = true;
  } else if (!possibleRates.includes(currency)) {
    addMessage(
      `Nie znaleziono waluty "${currency}". Upewnij się, że jest poprawna.`
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

const getAPIUrl = (date, currency) => {
  const startingDate = dayjs(date).subtract(8, "day").format("YYYY-MM-DD");
  const endingDate = dayjs(date).subtract(1, "day").format("YYYY-MM-DD");
  return `${API_URL}/rates/A/${currency}/${startingDate}/${endingDate}`;
};

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
  const exchangeRateDecimalPlaces = exchangeRate
    .toString()
    .split(".")[1].length;
  const amountDecimalPlaces = amount.toString().split(".")[1]?.length ?? 0;
  const decimalPlaces = exchangeRateDecimalPlaces + amountDecimalPlaces;

  const exchangeRateInt = BigInt(exchangeRate.toString().replace(".", ""));
  const amountInt = BigInt(amount.toString().replace(".", ""));

  const intResult = (exchangeRateInt * amountInt)
    .toString()
    .padStart(decimalPlaces + 1, "0");

  const result = `${intResult.slice(0, -decimalPlaces)}.${intResult.slice(
    -decimalPlaces
  )}`;
  resultContainer.innerHTML = "";
  addMessage(`1 ${code} = ${exchangeRate} PLN`);
  addMessage(`TAB ${table} z dnia: ${date}`);
  addMessage(
    `${amount[0] === "." ? "0" + amount : amount} ${code} = ${result} PLN`
  );
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

dateInput.setAttribute("max", dayjs().format("YYYY-MM-DD"));
