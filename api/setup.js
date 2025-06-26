const fs = require("fs");
const path = require("path");

let config = {
  BASE_URL: "localhost",
  PORT: 3000,
};

function setAngularEnv() {
  const envPath = path.join(__dirname, "environments", ".env");
  const angularEnvDir = path.join(__dirname, "..", "app", "environments");
  const angularEnvFile = path.join(angularEnvDir, "environment.ts");

  if (fs.existsSync(envPath)) {
    try {
      const envContent = fs.readFileSync(envPath, "utf8");
      const envVars = parseEnvFile(envContent);

      if (envVars.DOMAIN) config.BASE_URL = envVars.DOMAIN;
      if (envVars.PORT) config.PORT = envVars.PORT;

      if (envVars.SSL === true || envVars.SSL === "true") {
        config.BASE_URL = `https://${config.BASE_URL}`;
        config.PORT = 443;
      } else {
        config.BASE_URL = `http://${config.BASE_URL}`;
      }
    } catch (error) {
      console.error("Erro ao ler arquivo .env:", error.message);
      config.BASE_URL = `http://${config.BASE_URL}`;
    }
  } else {
    console.log("Arquivo .env não encontrado, usando configuração padrão...");
    config.BASE_URL = `http://${config.BASE_URL}`;
  }

  if (!fs.existsSync(angularEnvDir)) {
    fs.mkdirSync(angularEnvDir, { recursive: true });
  }

  generateEnvironmentFile(angularEnvFile, config);
}

function parseEnvFile(content) {
  const envVars = {};

  content.split("\n").forEach((line) => {
    line = line.trim();
    if (!line || line.startsWith("#")) return;

    const equalIndex = line.indexOf("=");
    if (equalIndex === -1) return;

    const key = line.substring(0, equalIndex).trim();
    let value = line.substring(equalIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (/^\d+$/.test(value)) {
      value = parseInt(value, 10);
    } else if (/^\d*\.\d+$/.test(value)) {
      value = parseFloat(value);
    } else if (value.toLowerCase() === "true") {
      value = true;
    } else if (value.toLowerCase() === "false") {
      value = false;
    }

    envVars[key] = value;
  });

  return envVars;
}

function generateEnvironmentFile(filePath, config) {
  const configEntries = Object.entries(config)
    .map(([key, value]) => `\n  ${key}: ${JSON.stringify(value)}`)
    .join(",");

  const content = `export const environment = {${configEntries}\n};`;

  try {
    fs.writeFileSync(filePath, content, "utf8");
  } catch (error) {
    console.error(`Erro ao escrever environment.ts:`, error.message);
  }
}

setAngularEnv();
