const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require("cors");
const { errorMiddleware } = require('./middleware/error.js');
const userRouter = require('./routes/userRoute.js')
const messageRouter = require('./routes/messageRoute.js')
const timelineRouter = require('./routes/timelineRoute.js')
const softwareAppRoute = require('./routes/softwareAppRoute.js')
const projectRouter = require('./routes/projectRoute.js')
const skillsRouter = require('./routes/skillsRoute.js')
const experninceRouter = require('./routes/experninceRoute.js')
const { databaseConnection } = require("./db/db.js")

dotenv.config({ path: "./config.env" });

const app = express();

app.use(
    cors({
        origin: [process.env.PROTFOLIO_URL, process.env.DASHBOARD_URL, "*"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/user", userRouter)
app.use("/api/v1/timeline", timelineRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/softwareapplication", softwareAppRoute);
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/skill", skillsRouter);
app.use("/api/v1/expernince", experninceRouter);


databaseConnection()

app.use(errorMiddleware);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
