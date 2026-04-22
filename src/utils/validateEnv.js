/**
 * Simple utility to ensure all required environment variables are present.
 * Fails fast with a clear error message if something is missing.
 */
const requiredEnv = [
  'DATABASE_URL',
  'JWT_SECRET'
];

export const validateEnv = () => {
  const missing = requiredEnv.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error(`\n ERROR: Missing required environment variables:`);
    missing.forEach(key => console.error(`   - ${key}`));
    console.error(`\nPlease check your .env file or hosting environment settings.\n`);
    process.exit(1);
  }
};
