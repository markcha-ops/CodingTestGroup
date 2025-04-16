// This file exists to suppress source map warnings
// Add this import to your index.js file to suppress the warnings 
// The warnings come from monaco-editor and stylis-plugin-rtl packages

const originalConsoleWarn = console.warn;

console.warn = function filterWarnings(msg, ...args) {
  // Check if this is a source map warning for the problematic packages
  if (
    typeof msg === 'string' &&
    (
      msg.includes('monaco-editor') ||
      msg.includes('stylis-plugin-rtl') ||
      msg.includes('Failed to parse source map')
    )
  ) {
    return; // Suppress these warnings
  }
  
  // Pass through any other warnings
  return originalConsoleWarn.apply(console, [msg, ...args]);
};

export default {}; 