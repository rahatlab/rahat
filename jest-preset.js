/** @type {import('next/jest').Config} */
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js config file(s)
  dir: './'
})

// Add any custom config here
const config = {
  // Add custom config for Jest here
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@components/(.*)$": "<rootDir>/components/$1",
    "^@/lib/(.*)$": "<rootDir>/lib/$1"
  },
  testEnvironment: 'jsdom'
}

module.exports = createJestConfig(config)