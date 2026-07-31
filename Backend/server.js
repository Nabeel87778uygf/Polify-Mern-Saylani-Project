import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import pollRouter from "./routes/pollRoutes.js";
import commentRouter from './routes/commentRoutes.js';
import userRouter from './routes/userRoutes.js';

const PORT = process.env.PORT || 5000;
const app = express();

//middleware
app.use(cors(
    {
        origin: process.env.CLIENT_URL,
        credentials: true
    }
));

app.use(express.json());

// Disable caching for API responses
app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
});

// Connect to Database
connectDB();

//routes
app.use("/api/auth", authRoutes);
app.use("/api/polls", pollRouter);
app.use('/api/comments', commentRouter);
app.use('/api/users', userRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/notification", notificationRouter);


app.get("/", (req, res) => {
    res.send("Api is working!");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});