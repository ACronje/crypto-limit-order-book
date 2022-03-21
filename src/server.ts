import app from "./app";

const port = 3000;

app.listen(port, () => {
  console.log(`crypto-limit-order-book API is running on port ${port}.`);
});
