const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

// In-memory user store (keyed by username)
const users = {};

/**
 * Register a new user with a hashed password.
 * Returns null if the username is already taken.
 */
async function registerUser(username, password) {
  if (users[username]) {
    return null;
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  users[username] = { username, passwordHash };
  return { username };
}

/**
 * Verify credentials. Returns the user object on success, null on failure.
 */
async function verifyUser(username, password) {
  const user = users[username];
  if (!user) {
    return null;
  }
  const match = await bcrypt.compare(password, user.passwordHash);
  return match ? { username: user.username } : null;
}

/**
 * Reset the user store (used in tests).
 */
function resetUsers() {
  Object.keys(users).forEach((k) => delete users[k]);
}

module.exports = { registerUser, verifyUser, resetUsers };
