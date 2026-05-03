export type Language = 'en' | 'ru' | 'uz';

export const LANGUAGES: { code: Language; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский' },
  { code: 'uz', label: 'Uzbek', nativeLabel: "O'zbekcha" },
];

export const DEFAULT_LANGUAGE: Language = 'en';

export type TranslationKey =
  | 'nav.catalog'
  | 'nav.profile'
  | 'nav.admin'
  | 'nav.settings'
  | 'nav.signIn'
  | 'nav.signOut'
  | 'nav.register'
  | 'footer.text'
  | 'catalog.heroTitle'
  | 'catalog.heroSubtitle'
  | 'catalog.loading'
  | 'catalog.empty'
  | 'catalog.failed'
  | 'auth.signInTitle'
  | 'auth.signInSubtitle'
  | 'auth.registerTitle'
  | 'auth.registerSubtitle'
  | 'auth.email'
  | 'auth.password'
  | 'auth.confirmPassword'
  | 'auth.signIn'
  | 'auth.signingIn'
  | 'auth.createAccount'
  | 'auth.creatingAccount'
  | 'auth.haveAccount'
  | 'auth.newHere'
  | 'auth.passwordsMismatch'
  | 'auth.passwordTooShort'
  | 'auth.loginFailed'
  | 'auth.registrationFailed'
  | 'captcha.label'
  | 'captcha.placeholder'
  | 'captcha.refresh'
  | 'captcha.failedToLoad'
  | 'captcha.required'
  | 'game.license'
  | 'game.fileSize'
  | 'game.download'
  | 'game.preparingLink'
  | 'game.downloadFailed'
  | 'game.signInToDownload'
  | 'game.screenshots'
  | 'game.about'
  | 'game.failed'
  | 'game.loading'
  | 'profile.title'
  | 'profile.history'
  | 'profile.empty'
  | 'profile.browse'
  | 'settings.title'
  | 'settings.languageSection'
  | 'settings.languageHelp'
  | 'settings.account'
  | 'settings.signedInAs'
  | 'settings.signedOut'
  | 'settings.role'
  | 'common.required'
  | 'common.signedInAs'
  | 'role.admin'
  | 'role.user';

type Dict = Record<TranslationKey, string>;

const en: Dict = {
  'nav.catalog': 'Catalog',
  'nav.profile': 'Profile',
  'nav.admin': 'Admin',
  'nav.settings': 'Settings',
  'nav.signIn': 'Sign in',
  'nav.signOut': 'Sign out',
  'nav.register': 'Register',
  'footer.text':
    'Uzisoft · A catalog for legally free and open-source games. Only games whose license permits free redistribution are listed.',
  'catalog.heroTitle': 'Free & Open-Source Games',
  'catalog.heroSubtitle':
    'Curated catalog of games with licenses that permit free redistribution. Browse, sign in, and download — no hidden fees, no piracy.',
  'catalog.loading': 'Loading catalog…',
  'catalog.empty': 'No games yet. Check back soon — or sign in as admin to add the first one.',
  'catalog.failed': 'Failed to load games',
  'auth.signInTitle': 'Welcome back',
  'auth.signInSubtitle': 'Sign in to download free games.',
  'auth.registerTitle': 'Create your account',
  'auth.registerSubtitle': 'Free, no credit card required.',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.confirmPassword': 'Confirm password',
  'auth.signIn': 'Sign in',
  'auth.signingIn': 'Signing in…',
  'auth.createAccount': 'Create account',
  'auth.creatingAccount': 'Creating account…',
  'auth.haveAccount': 'Already have an account?',
  'auth.newHere': 'New here?',
  'auth.passwordsMismatch': 'Passwords do not match',
  'auth.passwordTooShort': 'Password must be at least 6 characters',
  'auth.loginFailed': 'Login failed',
  'auth.registrationFailed': 'Registration failed',
  'captcha.label': 'Type the characters you see',
  'captcha.placeholder': 'Captcha code',
  'captcha.refresh': 'Refresh captcha',
  'captcha.failedToLoad': 'Captcha failed to load',
  'captcha.required': 'Please complete the captcha',
  'game.license': 'License',
  'game.fileSize': 'File size',
  'game.download': 'Download',
  'game.preparingLink': 'Preparing link…',
  'game.downloadFailed': 'Download failed',
  'game.signInToDownload': 'Sign in to download this game.',
  'game.screenshots': 'Screenshots',
  'game.about': 'About',
  'game.failed': 'Failed to load game',
  'game.loading': 'Loading game…',
  'profile.title': 'Your profile',
  'profile.history': 'Download history',
  'profile.empty': "You haven't downloaded any games yet.",
  'profile.browse': 'Browse the catalog',
  'settings.title': 'Settings',
  'settings.languageSection': 'Language',
  'settings.languageHelp':
    'Choose your preferred interface language. Your choice is saved on this device.',
  'settings.account': 'Account',
  'settings.signedInAs': 'Signed in as',
  'settings.signedOut': 'You are not signed in.',
  'settings.role': 'Role',
  'common.required': 'required',
  'common.signedInAs': 'Signed in as',
  'role.admin': 'admin',
  'role.user': 'user',
};

const ru: Dict = {
  'nav.catalog': 'Каталог',
  'nav.profile': 'Профиль',
  'nav.admin': 'Админ',
  'nav.settings': 'Настройки',
  'nav.signIn': 'Войти',
  'nav.signOut': 'Выйти',
  'nav.register': 'Регистрация',
  'footer.text':
    'Uzisoft · Каталог легально бесплатных и open-source игр. Здесь только игры, лицензия которых разрешает свободное распространение.',
  'catalog.heroTitle': 'Бесплатные и open-source игры',
  'catalog.heroSubtitle':
    'Подборка игр с лицензиями, разрешающими свободное распространение. Смотрите каталог, входите и скачивайте — без скрытых платежей и пиратства.',
  'catalog.loading': 'Загружаем каталог…',
  'catalog.empty': 'Игр пока нет. Заходите позже — или войдите как админ, чтобы добавить первую.',
  'catalog.failed': 'Не удалось загрузить игры',
  'auth.signInTitle': 'С возвращением',
  'auth.signInSubtitle': 'Войдите, чтобы скачивать игры.',
  'auth.registerTitle': 'Создать аккаунт',
  'auth.registerSubtitle': 'Бесплатно, без карты.',
  'auth.email': 'Email',
  'auth.password': 'Пароль',
  'auth.confirmPassword': 'Подтвердите пароль',
  'auth.signIn': 'Войти',
  'auth.signingIn': 'Входим…',
  'auth.createAccount': 'Создать аккаунт',
  'auth.creatingAccount': 'Создаём аккаунт…',
  'auth.haveAccount': 'Уже есть аккаунт?',
  'auth.newHere': 'Впервые здесь?',
  'auth.passwordsMismatch': 'Пароли не совпадают',
  'auth.passwordTooShort': 'Пароль должен быть не короче 6 символов',
  'auth.loginFailed': 'Не удалось войти',
  'auth.registrationFailed': 'Не удалось зарегистрироваться',
  'captcha.label': 'Введите символы с картинки',
  'captcha.placeholder': 'Код с картинки',
  'captcha.refresh': 'Обновить капчу',
  'captcha.failedToLoad': 'Не удалось загрузить капчу',
  'captcha.required': 'Пожалуйста, пройдите капчу',
  'game.license': 'Лицензия',
  'game.fileSize': 'Размер файла',
  'game.download': 'Скачать',
  'game.preparingLink': 'Готовим ссылку…',
  'game.downloadFailed': 'Не удалось скачать',
  'game.signInToDownload': 'Войдите, чтобы скачать эту игру.',
  'game.screenshots': 'Скриншоты',
  'game.about': 'Об игре',
  'game.failed': 'Не удалось загрузить игру',
  'game.loading': 'Загружаем игру…',
  'profile.title': 'Ваш профиль',
  'profile.history': 'История скачиваний',
  'profile.empty': 'Вы ещё ничего не скачали.',
  'profile.browse': 'Открыть каталог',
  'settings.title': 'Настройки',
  'settings.languageSection': 'Язык',
  'settings.languageHelp':
    'Выберите язык интерфейса. Ваш выбор сохраняется на этом устройстве.',
  'settings.account': 'Аккаунт',
  'settings.signedInAs': 'Вы вошли как',
  'settings.signedOut': 'Вы не вошли в аккаунт.',
  'settings.role': 'Роль',
  'common.required': 'обязательно',
  'common.signedInAs': 'Вы вошли как',
  'role.admin': 'админ',
  'role.user': 'пользователь',
};

const uz: Dict = {
  'nav.catalog': 'Katalog',
  'nav.profile': 'Profil',
  'nav.admin': 'Admin',
  'nav.settings': 'Sozlamalar',
  'nav.signIn': 'Kirish',
  'nav.signOut': 'Chiqish',
  'nav.register': "Ro'yxatdan o'tish",
  'footer.text':
    "Uzisoft · Qonuniy bepul va ochiq manbali o'yinlar katalogi. Bu yerda faqat litsenziyasi erkin tarqatishga ruxsat beruvchi o'yinlar.",
  'catalog.heroTitle': "Bepul va ochiq manbali o'yinlar",
  'catalog.heroSubtitle':
    "Litsenziyasi erkin tarqatishga ruxsat beradigan o'yinlar tanlovi. Katalogni ko'ring, tizimga kiring va yuklab oling — yashirin to'lovlar yoki noqonuniy nusxalar yo'q.",
  'catalog.loading': "Katalog yuklanmoqda…",
  'catalog.empty':
    "Hozircha o'yinlar yo'q. Keyinroq qayting — yoki birinchi o'yinni qo'shish uchun admin sifatida kiring.",
  'catalog.failed': "O'yinlarni yuklab bo'lmadi",
  'auth.signInTitle': 'Xush kelibsiz',
  'auth.signInSubtitle': "Bepul o'yinlarni yuklab olish uchun tizimga kiring.",
  'auth.registerTitle': "Hisob yaratish",
  'auth.registerSubtitle': 'Bepul, karta talab qilinmaydi.',
  'auth.email': 'Email',
  'auth.password': 'Parol',
  'auth.confirmPassword': 'Parolni tasdiqlang',
  'auth.signIn': 'Kirish',
  'auth.signingIn': 'Kirilmoqda…',
  'auth.createAccount': 'Hisob yaratish',
  'auth.creatingAccount': 'Hisob yaratilmoqda…',
  'auth.haveAccount': 'Allaqachon hisobingiz bormi?',
  'auth.newHere': 'Yangi keldingizmi?',
  'auth.passwordsMismatch': 'Parollar mos kelmadi',
  'auth.passwordTooShort': "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
  'auth.loginFailed': "Kirib bo'lmadi",
  'auth.registrationFailed': "Ro'yxatdan o'tib bo'lmadi",
  'captcha.label': 'Rasmda ko\u2018rgan belgilarni kiriting',
  'captcha.placeholder': 'Kapcha kodi',
  'captcha.refresh': 'Kapchani yangilash',
  'captcha.failedToLoad': "Kapchani yuklab bo'lmadi",
  'captcha.required': "Iltimos, kapchani to'ldiring",
  'game.license': 'Litsenziya',
  'game.fileSize': 'Fayl hajmi',
  'game.download': 'Yuklab olish',
  'game.preparingLink': 'Havola tayyorlanmoqda…',
  'game.downloadFailed': "Yuklab bo'lmadi",
  'game.signInToDownload': "Bu o'yinni yuklab olish uchun tizimga kiring.",
  'game.screenshots': 'Skrinshotlar',
  'game.about': "O'yin haqida",
  'game.failed': "O'yinni yuklab bo'lmadi",
  'game.loading': "O'yin yuklanmoqda…",
  'profile.title': 'Sizning profilingiz',
  'profile.history': 'Yuklab olishlar tarixi',
  'profile.empty': "Siz hali hech qanday o'yin yuklab olmadingiz.",
  'profile.browse': 'Katalogga o\u2018tish',
  'settings.title': 'Sozlamalar',
  'settings.languageSection': 'Til',
  'settings.languageHelp':
    "Interfeys tilini tanlang. Tanlovingiz shu qurilmada saqlanadi.",
  'settings.account': 'Hisob',
  'settings.signedInAs': 'Siz quyidagi sifatida kirgansiz',
  'settings.signedOut': 'Siz tizimga kirmagansiz.',
  'settings.role': 'Rol',
  'common.required': 'majburiy',
  'common.signedInAs': 'Siz quyidagi sifatida kirgansiz',
  'role.admin': 'admin',
  'role.user': 'foydalanuvchi',
};

export const TRANSLATIONS: Record<Language, Dict> = { en, ru, uz };
