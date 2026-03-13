import { app } from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  console.log(`🚀 ${env.APP_NAME} rodando na porta ${env.PORT}`);
  console.log(`🌐 Ambiente: ${env.NODE_ENV}`);
  console.log(`🔎 Health check: http://localhost:${env.PORT}/api/health`);
});
