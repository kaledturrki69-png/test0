import bcrypt from 'bcryptjs';

type StoredUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
};

const usersByEmail = new Map<string, StoredUser>();

// Seed a local demo user for easy testing
(() => {
  try {
    const email = 'demo@gmail.com';
    const name = 'Demo User';
    const passwordHash = bcrypt.hashSync('password', 10);
    usersByEmail.set(email, { id: email, name, email, passwordHash });
  } catch {}
})();

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const existing = usersByEmail.get(email.toLowerCase());
  if (existing) throw new Error('User already exists');
  const passwordHash = await bcrypt.hash(password, 10);
  const user: StoredUser = {
    id: email,
    name,
    email,
    passwordHash
  };
  usersByEmail.set(email.toLowerCase(), user);
  return { id: user.id, name: user.name, email: user.email };
}

export async function verifyUserCredentials(email: string, password: string) {
  const user = usersByEmail.get(email.toLowerCase());
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return { id: user.id, name: user.name, email: user.email };
}
