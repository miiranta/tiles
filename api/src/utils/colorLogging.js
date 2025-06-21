// Console colors utility
const colors = {
  reset: '\x1b[0m',
  white: '\x1b[37m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (module, message) => {
    console.log(`${colors.white}[${module}] ${message}${colors.reset}`);
  },
  success: (module, message) => {
    console.log(`${colors.green}[${module}] ${message}${colors.reset}`);
  },
  error: (module, message) => {
    console.log(`${colors.red}[${module}] ${message}${colors.reset}`);
  },
  warn: (module, message) => {
    console.log(`${colors.yellow}[${module}] ${message}${colors.reset}`);
  }
};

module.exports = { colors, log };
