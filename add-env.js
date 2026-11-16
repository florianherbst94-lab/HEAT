const { execSync } = require('child_process');
const key = process.argv[2];
try {
  execSync(`npx vercel env add STRIPE_SECRET_KEY production << INPUT
secret
${key}
INPUT`, { stdio: 'inherit' });
} catch (e) {
  console.log("Failed", e.message);
}
