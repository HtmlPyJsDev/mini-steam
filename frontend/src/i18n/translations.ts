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
  | 'nav.friends'
  | 'nav.messages'
  | 'nav.developer'
  | 'footer.text'
  | 'catalog.heroTitle'
  | 'catalog.heroSubtitle'
  | 'catalog.loading'
  | 'catalog.empty'
  | 'catalog.failed'
  | 'catalog.uploadedBy'
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
  | 'profile.editProfile'
  | 'profile.displayName'
  | 'profile.displayNamePlaceholder'
  | 'profile.bio'
  | 'profile.bioPlaceholder'
  | 'profile.save'
  | 'profile.saving'
  | 'profile.saved'
  | 'profile.avatar'
  | 'profile.uploadAvatar'
  | 'profile.removeAvatar'
  | 'profile.uploading'
  | 'profile.publicProfile'
  | 'profile.viewPublic'
  | 'profile.notFound'
  | 'profile.banned'
  | 'profile.bannedReason'
  | 'profile.friendsCount'
  | 'profile.memberSince'
  | 'profile.developerGame'
  | 'settings.title'
  | 'settings.languageSection'
  | 'settings.languageHelp'
  | 'settings.account'
  | 'settings.signedInAs'
  | 'settings.signedOut'
  | 'settings.role'
  | 'common.required'
  | 'common.signedInAs'
  | 'common.cancel'
  | 'common.save'
  | 'common.loading'
  | 'common.error'
  | 'common.you'
  | 'role.admin'
  | 'role.user'
  | 'role.developer'
  | 'friends.title'
  | 'friends.searchPlaceholder'
  | 'friends.searchHint'
  | 'friends.add'
  | 'friends.requestSent'
  | 'friends.alreadyFriends'
  | 'friends.incoming'
  | 'friends.outgoing'
  | 'friends.list'
  | 'friends.empty'
  | 'friends.noRequests'
  | 'friends.accept'
  | 'friends.reject'
  | 'friends.remove'
  | 'friends.cancel'
  | 'friends.message'
  | 'friends.openProfile'
  | 'friends.notSignedIn'
  | 'chat.title'
  | 'chat.placeholder'
  | 'chat.send'
  | 'chat.empty'
  | 'chat.notFriends'
  | 'chat.noConversations'
  | 'chat.openChat'
  | 'developer.title'
  | 'developer.slotFree'
  | 'developer.slotUsed'
  | 'developer.slotHint'
  | 'developer.title2'
  | 'developer.description'
  | 'developer.license'
  | 'developer.coverImage'
  | 'developer.screenshots'
  | 'developer.gameFile'
  | 'developer.submit'
  | 'developer.submitting'
  | 'developer.statusPending'
  | 'developer.statusApproved'
  | 'developer.statusRejected'
  | 'developer.notDeveloper'
  | 'developer.askAdmin'
  | 'admin.tabsGames'
  | 'admin.tabsUsers'
  | 'admin.tabsPending'
  | 'admin.users'
  | 'admin.searchUsers'
  | 'admin.role'
  | 'admin.ban'
  | 'admin.unban'
  | 'admin.banConfirm'
  | 'admin.banReasonPrompt'
  | 'admin.changeRoleConfirm'
  | 'admin.userBanned'
  | 'admin.bannedAccount'
  | 'admin.pendingTitle'
  | 'admin.pendingEmpty'
  | 'admin.approve'
  | 'admin.reject';

type Dict = Record<TranslationKey, string>;

const en: Dict = {
  'nav.catalog': 'Catalog',
  'nav.profile': 'Profile',
  'nav.admin': 'Admin',
  'nav.settings': 'Settings',
  'nav.signIn': 'Sign in',
  'nav.signOut': 'Sign out',
  'nav.register': 'Register',
  'nav.friends': 'Friends',
  'nav.messages': 'Messages',
  'nav.developer': 'My game',
  'footer.text':
    'Uzisoft · A catalog for legally free and open-source games. Only games whose license permits free redistribution are listed.',
  'catalog.heroTitle': 'Free & Open-Source Games',
  'catalog.heroSubtitle':
    'Curated catalog of games with licenses that permit free redistribution. Browse, sign in, and download — no hidden fees, no piracy.',
  'catalog.loading': 'Loading catalog…',
  'catalog.empty': 'No games yet. Check back soon — or sign in as admin to add the first one.',
  'catalog.failed': 'Failed to load games',
  'catalog.uploadedBy': 'by',
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
  'profile.editProfile': 'Edit profile',
  'profile.displayName': 'Display name',
  'profile.displayNamePlaceholder': 'How others see you',
  'profile.bio': 'Bio',
  'profile.bioPlaceholder': 'A few words about you',
  'profile.save': 'Save',
  'profile.saving': 'Saving…',
  'profile.saved': 'Profile saved',
  'profile.avatar': 'Avatar',
  'profile.uploadAvatar': 'Upload avatar',
  'profile.removeAvatar': 'Remove avatar',
  'profile.uploading': 'Uploading…',
  'profile.publicProfile': 'Public profile',
  'profile.viewPublic': 'View public profile',
  'profile.notFound': 'User not found',
  'profile.banned': 'This account is banned',
  'profile.bannedReason': 'Reason',
  'profile.friendsCount': 'Friends',
  'profile.memberSince': 'Member since',
  'profile.developerGame': 'Published game',
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
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.loading': 'Loading…',
  'common.error': 'Error',
  'common.you': 'You',
  'role.admin': 'admin',
  'role.user': 'user',
  'role.developer': 'developer',
  'friends.title': 'Friends',
  'friends.searchPlaceholder': 'Search by email or display name',
  'friends.searchHint': 'Type at least 2 characters',
  'friends.add': 'Add friend',
  'friends.requestSent': 'Request sent',
  'friends.alreadyFriends': 'Already friends',
  'friends.incoming': 'Incoming requests',
  'friends.outgoing': 'Outgoing requests',
  'friends.list': 'Your friends',
  'friends.empty': 'No friends yet. Search for someone to add.',
  'friends.noRequests': 'No pending requests.',
  'friends.accept': 'Accept',
  'friends.reject': 'Reject',
  'friends.remove': 'Remove',
  'friends.cancel': 'Cancel',
  'friends.message': 'Message',
  'friends.openProfile': 'Open profile',
  'friends.notSignedIn': 'Sign in to manage friends.',
  'chat.title': 'Messages',
  'chat.placeholder': 'Type a message…',
  'chat.send': 'Send',
  'chat.empty': 'No messages yet. Say hi!',
  'chat.notFriends': 'You must be friends to chat.',
  'chat.noConversations': 'No conversations yet. Add a friend first.',
  'chat.openChat': 'Open chat',
  'developer.title': 'Developer corner',
  'developer.slotFree': 'You can publish 1 game.',
  'developer.slotUsed':
    'You have already used your developer slot — only 1 game per developer is allowed.',
  'developer.slotHint':
    'Once submitted, your game goes through admin review before appearing in the catalog.',
  'developer.title2': 'Title',
  'developer.description': 'Description',
  'developer.license': 'License (only legally free / open-source)',
  'developer.coverImage': 'Cover image',
  'developer.screenshots': 'Screenshots',
  'developer.gameFile': 'Game file',
  'developer.submit': 'Submit for review',
  'developer.submitting': 'Submitting…',
  'developer.statusPending': 'Pending review',
  'developer.statusApproved': 'Approved',
  'developer.statusRejected': 'Rejected',
  'developer.notDeveloper': 'Only developers can publish a game.',
  'developer.askAdmin':
    'Ask the admin to grant you the “developer” role to publish your own game.',
  'admin.tabsGames': 'Games',
  'admin.tabsUsers': 'Users',
  'admin.tabsPending': 'Pending',
  'admin.users': 'User management',
  'admin.searchUsers': 'Search users',
  'admin.role': 'Role',
  'admin.ban': 'Ban',
  'admin.unban': 'Unban',
  'admin.banConfirm': 'Ban this user?',
  'admin.banReasonPrompt': 'Reason (optional):',
  'admin.changeRoleConfirm': 'Change role?',
  'admin.userBanned': 'BANNED',
  'admin.bannedAccount': 'Your account is banned.',
  'admin.pendingTitle': 'Pending games',
  'admin.pendingEmpty': 'No pending games.',
  'admin.approve': 'Approve',
  'admin.reject': 'Reject',
};

const ru: Dict = {
  'nav.catalog': 'Каталог',
  'nav.profile': 'Профиль',
  'nav.admin': 'Админ',
  'nav.settings': 'Настройки',
  'nav.signIn': 'Войти',
  'nav.signOut': 'Выйти',
  'nav.register': 'Регистрация',
  'nav.friends': 'Друзья',
  'nav.messages': 'Сообщения',
  'nav.developer': 'Моя игра',
  'footer.text':
    'Uzisoft · Каталог легально бесплатных и open-source игр. Здесь только игры, лицензия которых разрешает свободное распространение.',
  'catalog.heroTitle': 'Бесплатные и open-source игры',
  'catalog.heroSubtitle':
    'Подборка игр с лицензиями, разрешающими свободное распространение. Смотрите каталог, входите и скачивайте — без скрытых платежей и пиратства.',
  'catalog.loading': 'Загружаем каталог…',
  'catalog.empty': 'Игр пока нет. Заходите позже — или войдите как админ, чтобы добавить первую.',
  'catalog.failed': 'Не удалось загрузить игры',
  'catalog.uploadedBy': 'от',
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
  'profile.editProfile': 'Редактировать профиль',
  'profile.displayName': 'Имя профиля',
  'profile.displayNamePlaceholder': 'Как вас увидят другие',
  'profile.bio': 'О себе',
  'profile.bioPlaceholder': 'Пару слов о вас',
  'profile.save': 'Сохранить',
  'profile.saving': 'Сохраняем…',
  'profile.saved': 'Профиль сохранён',
  'profile.avatar': 'Аватар',
  'profile.uploadAvatar': 'Загрузить аватар',
  'profile.removeAvatar': 'Удалить аватар',
  'profile.uploading': 'Загружаем…',
  'profile.publicProfile': 'Публичный профиль',
  'profile.viewPublic': 'Посмотреть как видят другие',
  'profile.notFound': 'Пользователь не найден',
  'profile.banned': 'Этот аккаунт заблокирован',
  'profile.bannedReason': 'Причина',
  'profile.friendsCount': 'Друзей',
  'profile.memberSince': 'С нами с',
  'profile.developerGame': 'Опубликованная игра',
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
  'common.cancel': 'Отмена',
  'common.save': 'Сохранить',
  'common.loading': 'Загрузка…',
  'common.error': 'Ошибка',
  'common.you': 'Вы',
  'role.admin': 'админ',
  'role.user': 'пользователь',
  'role.developer': 'разработчик',
  'friends.title': 'Друзья',
  'friends.searchPlaceholder': 'Поиск по email или имени',
  'friends.searchHint': 'Введите минимум 2 символа',
  'friends.add': 'Добавить в друзья',
  'friends.requestSent': 'Запрос отправлен',
  'friends.alreadyFriends': 'Уже друзья',
  'friends.incoming': 'Входящие запросы',
  'friends.outgoing': 'Исходящие запросы',
  'friends.list': 'Ваши друзья',
  'friends.empty': 'Друзей пока нет. Найдите кого-нибудь и добавьте.',
  'friends.noRequests': 'Запросов нет.',
  'friends.accept': 'Принять',
  'friends.reject': 'Отклонить',
  'friends.remove': 'Удалить',
  'friends.cancel': 'Отменить',
  'friends.message': 'Сообщение',
  'friends.openProfile': 'Открыть профиль',
  'friends.notSignedIn': 'Войдите, чтобы управлять друзьями.',
  'chat.title': 'Сообщения',
  'chat.placeholder': 'Напишите сообщение…',
  'chat.send': 'Отправить',
  'chat.empty': 'Сообщений пока нет. Поздоровайтесь!',
  'chat.notFriends': 'Чтобы переписываться, нужно быть друзьями.',
  'chat.noConversations': 'Чатов пока нет. Сначала добавьте друга.',
  'chat.openChat': 'Открыть чат',
  'developer.title': 'Кабинет разработчика',
  'developer.slotFree': 'Вы можете опубликовать 1 игру.',
  'developer.slotUsed':
    'Вы уже использовали слот — только 1 игра на разработчика.',
  'developer.slotHint':
    'После отправки игра проходит проверку админа перед появлением в каталоге.',
  'developer.title2': 'Название',
  'developer.description': 'Описание',
  'developer.license': 'Лицензия (только легально бесплатные / open-source)',
  'developer.coverImage': 'Обложка',
  'developer.screenshots': 'Скриншоты',
  'developer.gameFile': 'Файл игры',
  'developer.submit': 'Отправить на проверку',
  'developer.submitting': 'Отправляем…',
  'developer.statusPending': 'На проверке',
  'developer.statusApproved': 'Одобрена',
  'developer.statusRejected': 'Отклонена',
  'developer.notDeveloper': 'Только разработчики могут опубликовать игру.',
  'developer.askAdmin':
    'Попросите админа выдать вам роль «разработчик», чтобы опубликовать свою игру.',
  'admin.tabsGames': 'Игры',
  'admin.tabsUsers': 'Пользователи',
  'admin.tabsPending': 'На проверке',
  'admin.users': 'Управление пользователями',
  'admin.searchUsers': 'Поиск пользователей',
  'admin.role': 'Роль',
  'admin.ban': 'Забанить',
  'admin.unban': 'Разбанить',
  'admin.banConfirm': 'Забанить этого пользователя?',
  'admin.banReasonPrompt': 'Причина (опционально):',
  'admin.changeRoleConfirm': 'Изменить роль?',
  'admin.userBanned': 'ЗАБАНЕН',
  'admin.bannedAccount': 'Ваш аккаунт заблокирован.',
  'admin.pendingTitle': 'Игры на проверке',
  'admin.pendingEmpty': 'Игр на проверке нет.',
  'admin.approve': 'Одобрить',
  'admin.reject': 'Отклонить',
};

const uz: Dict = {
  'nav.catalog': 'Katalog',
  'nav.profile': 'Profil',
  'nav.admin': 'Admin',
  'nav.settings': 'Sozlamalar',
  'nav.signIn': 'Kirish',
  'nav.signOut': 'Chiqish',
  'nav.register': "Ro'yxatdan o'tish",
  'nav.friends': "Do'stlar",
  'nav.messages': 'Xabarlar',
  'nav.developer': "Mening o'yinim",
  'footer.text':
    "Uzisoft · Qonuniy bepul va ochiq manbali o'yinlar katalogi. Bu yerda faqat litsenziyasi erkin tarqatishga ruxsat beruvchi o'yinlar.",
  'catalog.heroTitle': "Bepul va ochiq manbali o'yinlar",
  'catalog.heroSubtitle':
    "Litsenziyasi erkin tarqatishga ruxsat beradigan o'yinlar tanlovi. Katalogni ko'ring, tizimga kiring va yuklab oling — yashirin to'lovlar yoki noqonuniy nusxalar yo'q.",
  'catalog.loading': 'Katalog yuklanmoqda…',
  'catalog.empty':
    "Hozircha o'yinlar yo'q. Keyinroq qayting — yoki birinchi o'yinni qo'shish uchun admin sifatida kiring.",
  'catalog.failed': "O'yinlarni yuklab bo'lmadi",
  'catalog.uploadedBy': 'tomonidan',
  'auth.signInTitle': 'Xush kelibsiz',
  'auth.signInSubtitle': "Bepul o'yinlarni yuklab olish uchun tizimga kiring.",
  'auth.registerTitle': 'Hisob yaratish',
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
  'captcha.label': "Rasmda ko'rgan belgilarni kiriting",
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
  'profile.browse': "Katalogga o'tish",
  'profile.editProfile': 'Profilni tahrirlash',
  'profile.displayName': 'Profil nomi',
  'profile.displayNamePlaceholder': "Boshqalar sizni qanday ko'radi",
  'profile.bio': 'Sizingiz haqingizda',
  'profile.bioPlaceholder': "O'zingiz haqingizda bir nechta so'z",
  'profile.save': 'Saqlash',
  'profile.saving': 'Saqlanmoqda…',
  'profile.saved': 'Profil saqlandi',
  'profile.avatar': 'Avatar',
  'profile.uploadAvatar': 'Avatar yuklash',
  'profile.removeAvatar': 'Avatarni olib tashlash',
  'profile.uploading': 'Yuklanmoqda…',
  'profile.publicProfile': 'Ommaviy profil',
  'profile.viewPublic': "Boshqalar nima ko'rishini ko'rish",
  'profile.notFound': 'Foydalanuvchi topilmadi',
  'profile.banned': 'Bu hisob bloklangan',
  'profile.bannedReason': 'Sabab',
  'profile.friendsCount': "Do'stlar",
  'profile.memberSince': "Ro'yxatdan o'tgan",
  'profile.developerGame': "Chiqarilgan o'yin",
  'settings.title': 'Sozlamalar',
  'settings.languageSection': 'Til',
  'settings.languageHelp':
    'Interfeys tilini tanlang. Tanlovingiz shu qurilmada saqlanadi.',
  'settings.account': 'Hisob',
  'settings.signedInAs': 'Siz quyidagi sifatida kirgansiz',
  'settings.signedOut': 'Siz tizimga kirmagansiz.',
  'settings.role': 'Rol',
  'common.required': 'majburiy',
  'common.signedInAs': 'Siz quyidagi sifatida kirgansiz',
  'common.cancel': 'Bekor qilish',
  'common.save': 'Saqlash',
  'common.loading': 'Yuklanmoqda…',
  'common.error': 'Xato',
  'common.you': 'Siz',
  'role.admin': 'admin',
  'role.user': 'foydalanuvchi',
  'role.developer': 'dasturchi',
  'friends.title': "Do'stlar",
  'friends.searchPlaceholder': 'Email yoki ism orqali izlash',
  'friends.searchHint': 'Kamida 2 ta belgi kiriting',
  'friends.add': "Do'st qo'shish",
  'friends.requestSent': "So'rov yuborildi",
  'friends.alreadyFriends': "Allaqachon do'stsiz",
  'friends.incoming': "Kiruvchi so'rovlar",
  'friends.outgoing': "Chiquvchi so'rovlar",
  'friends.list': "Sizning do'stlaringiz",
  'friends.empty': "Hozircha do'stlar yo'q. Birovni izlab qo'shing.",
  'friends.noRequests': "So'rovlar yo'q.",
  'friends.accept': 'Qabul qilish',
  'friends.reject': 'Rad etish',
  'friends.remove': "O'chirish",
  'friends.cancel': 'Bekor qilish',
  'friends.message': 'Xabar',
  'friends.openProfile': 'Profilni ochish',
  'friends.notSignedIn': "Do'stlarni boshqarish uchun tizimga kiring.",
  'chat.title': 'Xabarlar',
  'chat.placeholder': 'Xabar yozing…',
  'chat.send': 'Yuborish',
  'chat.empty': "Hozircha xabarlar yo'q. Salomlashing!",
  'chat.notFriends': "Yozishish uchun do'st bo'lishingiz kerak.",
  'chat.noConversations': "Hozircha suhbatlar yo'q. Avval do'st qo'shing.",
  'chat.openChat': 'Suhbatni ochish',
  'developer.title': 'Dasturchi sahifasi',
  'developer.slotFree': "Siz 1 ta o'yin chiqara olasiz.",
  'developer.slotUsed':
    "Siz allaqachon slotdan foydalandingiz — har bir dasturchiga faqat 1 ta o'yin.",
  'developer.slotHint':
    "Yuborgandan so'ng o'yin katalogga chiqishdan oldin admin tekshiruvidan o'tadi.",
  'developer.title2': 'Sarlavha',
  'developer.description': 'Tavsif',
  'developer.license': 'Litsenziya (faqat qonuniy bepul / ochiq manba)',
  'developer.coverImage': 'Muqova',
  'developer.screenshots': 'Skrinshotlar',
  'developer.gameFile': "O'yin fayli",
  'developer.submit': 'Tekshirishga yuborish',
  'developer.submitting': 'Yuborilmoqda…',
  'developer.statusPending': 'Tekshiruvda',
  'developer.statusApproved': 'Tasdiqlandi',
  'developer.statusRejected': 'Rad etildi',
  'developer.notDeveloper': "Faqat dasturchilar o'yin chiqara oladi.",
  'developer.askAdmin':
    "O'z o'yiningizni chiqarish uchun admindan «dasturchi» rolini berishni so'rang.",
  'admin.tabsGames': "O'yinlar",
  'admin.tabsUsers': 'Foydalanuvchilar',
  'admin.tabsPending': 'Tekshiruvda',
  'admin.users': 'Foydalanuvchilarni boshqarish',
  'admin.searchUsers': 'Foydalanuvchilarni izlash',
  'admin.role': 'Rol',
  'admin.ban': 'Bloklash',
  'admin.unban': 'Blokdan chiqarish',
  'admin.banConfirm': 'Bu foydalanuvchini bloklaymi?',
  'admin.banReasonPrompt': "Sabab (ixtiyoriy):",
  'admin.changeRoleConfirm': "Rolni o'zgartirilsinmi?",
  'admin.userBanned': 'BLOKLANGAN',
  'admin.bannedAccount': 'Sizning hisobingiz bloklangan.',
  'admin.pendingTitle': "Tekshiruvdagi o'yinlar",
  'admin.pendingEmpty': "Tekshiruvdagi o'yinlar yo'q.",
  'admin.approve': 'Tasdiqlash',
  'admin.reject': 'Rad etish',
};

export const TRANSLATIONS: Record<Language, Dict> = { en, ru, uz };
