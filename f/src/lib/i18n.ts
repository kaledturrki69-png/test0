export type Lang = 'en' | 'fr';

export const dictionaries: Record<Lang, Record<string, string>> = {
  en: {
    auth_title: 'Authentication',
    sign_in: 'Sign In',
    sign_up: 'Sign Up',
    email_label: 'Email',
    password_label: 'Password',
    name_label: 'Name',
    continue_with_email: 'Continue With Email',
    sign_in_button: 'Sign In',
    create_account: 'Create Account',
    terms_caption: 'By clicking continue, you agree to our',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy'
  },
  fr: {
    auth_title: 'Authentification',
    sign_in: 'Se connecter',
    sign_up: "S'inscrire",
    email_label: 'E-mail',
    password_label: 'Mot de passe',
    name_label: 'Nom',
    continue_with_email: "Continuer avec l'e-mail",
    sign_in_button: 'Se connecter',
    create_account: 'Créer un compte',
    terms_caption: 'En cliquant sur continuer, vous acceptez nos',
    terms: 'Conditions d’utilisation',
    privacy: 'Politique de confidentialité'
  }
};

export function getLangFromSearch(): Lang {
  if (typeof window === 'undefined') return 'en';
  const p = new URLSearchParams(window.location.search);
  const l = p.get('lang');
  return l === 'fr' || l === 'en' ? l : 'en';
}

export function t(key: string, lang: Lang): string {
  return dictionaries[lang][key] ?? key;
}
