interface PasswordStrength {
  score: number;
  level: 'debil' | 'media' | 'fuerte';
  label: string;
  color: string;
  barPercent: number;
}

const usePasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return { score: 0, level: 'debil', label: '', color: '#e5e7eb', barPercent: 0 };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) {
    return { score, level: 'debil', label: 'Débil', color: '#ef4444', barPercent: 33 };
  }
  if (score <= 3) {
    return { score, level: 'media', label: 'Media', color: '#f59e0b', barPercent: 66 };
  }
  return { score, level: 'fuerte', label: 'Fuerte', color: '#22c55e', barPercent: 100 };
};

export default usePasswordStrength;
