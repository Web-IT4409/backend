const express = require("express");
const routes = require("./routes");
const requestLogger = require("./middlewares/requestLogger");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = process.env.APP_PORT || 3000;

app.use(express.json());
app.use(requestLogger);

app.use("/api", routes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
