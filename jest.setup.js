/**
 * Jest Setup File
 * Configure module mocks and global setup for tests
 */

// Mock next/image
const nextImage = require('next/image');
module.exports = nextImage;

// Mock lucide-react icons
jest.mock('lucide-react', () => {
  const originalModule = require('lucide-react');
  // Return a module with mocked icons
  return {
    ...originalModule,
    // Add any specific icon mocks here
  };
});

// Mock @/ path aliases
const originalResolve = require.resolve;
require.resolve = (request) => {
  if (request.startsWith('@/')) {
    return originalResolve(request.replace('@/', ''));
  }
  return originalResolve(request);
};