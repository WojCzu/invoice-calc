# Invoice calculator

The application converts the currency to PLN, using the exchange rate of the previous business day, counting from the day the invoice issuance. The result includes:

- exchange rate
- table name
- day of a given currency rate
- converted amount into PLNs

The application was created to speed up work in an accounting office.

## usage

1. Enter the invoice amount
2. Enter the invoice date
3. Enter the currency from the invoice
4. Submit data

## setup

1. Install all dependencies by typing `npm install`
2. Choose one:

- start dev server `npm start`
- build production version `npm run build`
- build development version `npm run dev`
