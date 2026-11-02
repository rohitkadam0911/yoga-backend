
import "dotenv/config";
import dns from "node:dns";
import app from "./app.js";
import connectDB from "./config/db.js";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error("❌ Database connection failed:", error);
        process.exit(1);
    }
};

startServer();
