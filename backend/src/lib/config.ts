import dotenv from "dotenv";

dotenv.config();

const config = {
	nodeEnv: process.env.NODE_ENV || "development",
	port: parseInt(process.env.PORT || "8080"),
	jwtSecret: process.env.JWT_SECRET,
	frontendUrl: process.env.FRONTEND_URL,
	adminPassword: process.env.ADMIN_PASSWORD,
};

for (const key in config) {
	if (!config[key as keyof typeof config]) {
		throw new Error(`${key} environment variable is missing!`);
	}
}

export default config;
