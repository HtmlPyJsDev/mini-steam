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
  | 'catalog.heroEyebrow'
  | 'catalog.heroTitle'
  | 'catalog.heroSubtitle'
  | 'catalog.heroBadge1'
  | 'catalog.heroBadge2'
  | 'catalog.heroBadge3'
  | 'catalog.loading'
  | 'catalog.empty'
  | 'catalog.failed'
  | 'fps.title'
  | 'fps.subtitle'
  | 'fps.detect'
  | 'fps.detecting'
  | 'fps.yourGpu'
  | 'fps.pickGpu'
  | 'fps.preset.weak'
  | 'fps.preset.entry'
  | 'fps.preset.mid'
  | 'fps.preset.high'
  | 'fps.preset.flagship'
  | 'fps.lowSettings'
  | 'fps.medSettings'
  | 'fps.highSettings'
  | 'fps.unsupported'
  | 'fps.not_set'
  | 'fps.note'
  | 'admin.gpuTier'
  | 'admin.gpuTierHint'
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
  | 'reviews.title'
  | 'reviews.empty'
  | 'reviews.leaveOne'
  | 'reviews.editYours'
  | 'reviews.rating'
  | 'reviews.textPlaceholder'
  | 'reviews.submit'
  | 'reviews.update'
  | 'reviews.sending'
  | 'reviews.delete'
  | 'reviews.confirmDelete'
  | 'reviews.signInToReview'
  | 'reviews.countSuffix'
  | 'reviews.pickRating'
  | 'reviews.loadError'
  | 'reviews.submitError'
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
  | 'role.security'
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
  | 'admin.reject'
  | 'shop.title'
  | 'shop.subtitle'
  | 'shop.eyebrow'
  | 'shop.buy'
  | 'shop.youHaveRole'
  | 'shop.roleDeveloperName'
  | 'shop.roleSecurityName'
  | 'shop.roleDeveloperDesc'
  | 'shop.roleSecurityDesc'
  | 'shop.perkPublishGame'
  | 'shop.perkDeveloperBadge'
  | 'shop.perkModerate'
  | 'shop.perkBanUsers'
  | 'shop.perkSecurityBadge'
  | 'shop.tgTitle'
  | 'shop.priceLabel'
  | 'shop.tgStep1Title'
  | 'shop.tgStep1Desc'
  | 'shop.tgStep2Title'
  | 'shop.tgStep2Desc'
  | 'shop.tgStep3Title'
  | 'shop.tgStep3Desc'
  | 'shop.openTelegram'
  | 'shop.notifyAdmin'
  | 'shop.notifying'
  | 'shop.notifyHint'
  | 'shop.cancel'
  | 'shop.requestSent'
  | 'shop.requestAlreadyPending'
  | 'shop.statusRequested'
  | 'shop.statusGranted'
  | 'shop.statusRejected'
  | 'shop.history'
  | 'shop.historyEmpty'
  | 'admin.requests'
  | 'admin.requestsTab'
  | 'admin.requestsEmpty'
  | 'admin.grantRole'
  | 'admin.rejectRequest'
  | 'admin.requestNote'
  | 'paywall.title'
  | 'paywall.developer'
  | 'paywall.security'
  | 'paywall.buy'
  | 'nav.shop';

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
  'catalog.heroEyebrow': 'Verified · Virus-free',
  'catalog.heroTitle': 'Play more, worry less',
  'catalog.heroSubtitle':
    'Every build on Uzisoft is hand-checked — no malware, no shady installers. Pick a title, hit download, play.',
  'catalog.heroBadge1': 'Manually checked',
  'catalog.heroBadge2': 'No viruses',
  'catalog.heroBadge3': 'Direct downloads',
  'catalog.loading': 'Loading catalog…',
  'catalog.empty': 'No games yet. Check back soon — or sign in as admin to add the first one.',
  'catalog.failed': 'Failed to load games',
  'catalog.uploadedBy': 'by',
  'fps.title': 'Estimated FPS on your PC',
  'fps.subtitle':
    'Rough estimate at 1080p based on your GPU. Real performance depends on CPU, RAM, drivers and game settings.',
  'fps.detect': 'Detect my GPU',
  'fps.detecting': 'Detecting…',
  'fps.yourGpu': 'Detected GPU',
  'fps.pickGpu': 'Or pick a class manually',
  'fps.preset.weak': 'Weak / integrated',
  'fps.preset.entry': 'Entry GPU (GTX 1050)',
  'fps.preset.mid': 'Mid-range (GTX 1660 / RTX 2060)',
  'fps.preset.high': 'High-end (RTX 3070 / 6700 XT)',
  'fps.preset.flagship': 'Flagship (RTX 4080 / 7900 XTX)',
  'fps.lowSettings': 'Low',
  'fps.medSettings': 'Medium',
  'fps.highSettings': 'High',
  'fps.unsupported': 'Could not detect — pick a GPU class above.',
  'fps.not_set':
    "FPS estimate isn't configured for this game yet. Ask the uploader to set the GPU tier.",
  'fps.note':
    'Estimate only. Real FPS varies with CPU, RAM, drivers and resolution.',
  'admin.gpuTier': 'GPU tier (1=light · 5=AAA)',
  'admin.gpuTierHint':
    'How demanding is this game? 1 = pixel art / 2D · 2 = small 3D · 3 = mainstream 3D (CS:GO) · 4 = AAA mid (GTA V) · 5 = AAA heavy (Crysis, Cyberpunk).',
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
  'reviews.title': 'Reviews',
  'reviews.empty': 'No reviews yet — be the first to leave one.',
  'reviews.leaveOne': 'Leave a review',
  'reviews.editYours': 'Update your review',
  'reviews.rating': 'Your rating',
  'reviews.textPlaceholder': 'Share your thoughts (optional)…',
  'reviews.submit': 'Post review',
  'reviews.update': 'Update review',
  'reviews.sending': 'Sending…',
  'reviews.delete': 'Delete',
  'reviews.confirmDelete': 'Delete this review?',
  'reviews.signInToReview': 'Sign in to leave a review.',
  'reviews.countSuffix': 'reviews',
  'reviews.pickRating': 'Please pick a rating from 1 to 5 stars.',
  'reviews.loadError': 'Failed to load reviews.',
  'reviews.submitError': 'Failed to submit review.',
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
  'role.security': 'security',
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
  'shop.title': 'Role store',
  'shop.subtitle':
    'Unlock new privileges. Pick a role, pay via Telegram, and the admin grants the role within minutes.',
  'shop.eyebrow': 'Premium roles',
  'shop.buy': 'Buy',
  'shop.youHaveRole': 'You already have this role.',
  'shop.roleDeveloperName': 'Developer',
  'shop.roleSecurityName': 'Security',
  'shop.roleDeveloperDesc': 'Publish your own game (1 slot per developer).',
  'shop.roleSecurityDesc':
    'Help moderate the platform — review pending games, ban abusive users.',
  'shop.perkPublishGame': 'Publish 1 game in the catalog',
  'shop.perkDeveloperBadge': 'Developer badge on your profile',
  'shop.perkModerate': 'Approve / reject games on the moderation queue',
  'shop.perkBanUsers': 'Ban or unban users for abuse',
  'shop.perkSecurityBadge': 'Security badge on your profile',
  'shop.tgTitle': 'How to pay',
  'shop.priceLabel': 'Amount to send',
  'shop.tgStep1Title': 'Open Telegram',
  'shop.tgStep1Desc': 'Message the admin {handle}.',
  'shop.tgStep2Title': 'Send {price}',
  'shop.tgStep2Desc':
    'Pay through any way you agree on. Mention your account email so the admin knows who to upgrade.',
  'shop.tgStep3Title': 'Get the role',
  'shop.tgStep3Desc':
    'Once the admin confirms, your role appears on your profile within a few minutes.',
  'shop.openTelegram': 'Open Telegram · {handle}',
  'shop.notifyAdmin': "I paid — notify the admin",
  'shop.notifying': 'Sending…',
  'shop.notifyHint':
    'Optional — creates a request in the admin panel so the admin can grant the role with one click.',
  'shop.cancel': 'Cancel',
  'shop.requestSent': 'Request sent. The admin will review it shortly.',
  'shop.requestAlreadyPending': 'You already have a pending request for this role.',
  'shop.statusRequested': 'Awaiting admin',
  'shop.statusGranted': 'Granted',
  'shop.statusRejected': 'Rejected',
  'shop.history': 'Purchase history',
  'shop.historyEmpty': 'No purchases yet.',
  'admin.requests': 'Role requests',
  'admin.requestsTab': 'Requests',
  'admin.requestsEmpty': 'No pending role requests.',
  'admin.grantRole': 'Grant role',
  'admin.rejectRequest': 'Reject',
  'admin.requestNote': 'User note',
  'paywall.title': 'Developer access required',
  'paywall.developer':
    "You don't have the developer role. Please buy it for $10 to publish your own game.",
  'paywall.security':
    "You don't have the security role. Please buy it for $20 to access moderation tools.",
  'paywall.buy': 'Buy in the store',
  'nav.shop': 'Store',
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
  'catalog.heroEyebrow': 'Проверено · Без вирусов',
  'catalog.heroTitle': 'Играйте, не переживая',
  'catalog.heroSubtitle':
    'Каждую сборку на Uzisoft мы проверяем вручную — никаких вирусов и левых установщиков. Выбирайте, скачивайте и играйте.',
  'catalog.heroBadge1': 'Проверено вручную',
  'catalog.heroBadge2': 'Без вирусов',
  'catalog.heroBadge3': 'Прямая загрузка',
  'catalog.loading': 'Загружаем каталог…',
  'catalog.empty': 'Игр пока нет. Заходите позже — или войдите как админ, чтобы добавить первую.',
  'catalog.failed': 'Не удалось загрузить игры',
  'catalog.uploadedBy': 'от',
  'fps.title': 'Сколько FPS будет у вас',
  'fps.subtitle':
    'Грубая оценка на 1080p по вашей видеокарте. Реальные результаты зависят от CPU, RAM, драйверов и настроек.',
  'fps.detect': 'Определить мою GPU',
  'fps.detecting': 'Определяем…',
  'fps.yourGpu': 'Ваша видеокарта',
  'fps.pickGpu': 'Или выберите класс вручную',
  'fps.preset.weak': 'Слабая / встроенная',
  'fps.preset.entry': 'Начальная (GTX 1050)',
  'fps.preset.mid': 'Средняя (GTX 1660 / RTX 2060)',
  'fps.preset.high': 'Топовая (RTX 3070 / 6700 XT)',
  'fps.preset.flagship': 'Флагман (RTX 4080 / 7900 XTX)',
  'fps.lowSettings': 'Низкие',
  'fps.medSettings': 'Средние',
  'fps.highSettings': 'Высокие',
  'fps.unsupported': 'Не удалось определить — выберите класс видеокарты сверху.',
  'fps.not_set':
    'Для этой игры оценка FPS не настроена. Попросите загрузившего указать GPU-класс.',
  'fps.note':
    'Только приблизительно. Реальные FPS зависят от CPU, RAM, драйверов и разрешения.',
  'admin.gpuTier': 'GPU-класс (1=лёгкая · 5=AAA)',
  'admin.gpuTierHint':
    'Насколько игра тяжёлая? 1 = пиксель-арт / 2D · 2 = небольшая 3D · 3 = массовая 3D (CS:GO) · 4 = средний AAA (GTA V) · 5 = тяжёлая AAA (Crysis, Cyberpunk).',
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
  'reviews.title': 'Отзывы',
  'reviews.empty': 'Пока нет отзывов — будьте первым.',
  'reviews.leaveOne': 'Оставить отзыв',
  'reviews.editYours': 'Изменить ваш отзыв',
  'reviews.rating': 'Ваша оценка',
  'reviews.textPlaceholder': 'Поделитесь впечатлениями (необязательно)…',
  'reviews.submit': 'Опубликовать',
  'reviews.update': 'Сохранить',
  'reviews.sending': 'Отправляем…',
  'reviews.delete': 'Удалить',
  'reviews.confirmDelete': 'Удалить этот отзыв?',
  'reviews.signInToReview': 'Войдите, чтобы оставить отзыв.',
  'reviews.countSuffix': 'отзывов',
  'reviews.pickRating': 'Поставьте оценку от 1 до 5 звёзд.',
  'reviews.loadError': 'Не удалось загрузить отзывы.',
  'reviews.submitError': 'Не удалось отправить отзыв.',
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
  'role.security': 'security',
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
  'shop.title': 'Магазин ролей',
  'shop.subtitle':
    'Получите новые возможности. Выберите роль, оплатите через Telegram — админ выдаст роль за считанные минуты.',
  'shop.eyebrow': 'Премиум-роли',
  'shop.buy': 'Купить',
  'shop.youHaveRole': 'У вас уже есть эта роль.',
  'shop.roleDeveloperName': 'Developer',
  'shop.roleSecurityName': 'Security',
  'shop.roleDeveloperDesc': 'Публикуйте свои игры (1 слот на разработчика).',
  'shop.roleSecurityDesc':
    'Помогайте модерировать платформу — проверяйте новые игры, блокируйте нарушителей.',
  'shop.perkPublishGame': 'Опубликовать 1 игру в каталоге',
  'shop.perkDeveloperBadge': 'Бейдж Developer в профиле',
  'shop.perkModerate': 'Одобрять и отклонять игры на проверке',
  'shop.perkBanUsers': 'Банить и разбанивать пользователей',
  'shop.perkSecurityBadge': 'Бейдж Security в профиле',
  'shop.tgTitle': 'Как оплатить',
  'shop.priceLabel': 'Сумма к оплате',
  'shop.tgStep1Title': 'Откройте Telegram',
  'shop.tgStep1Desc': 'Напишите админу {handle}.',
  'shop.tgStep2Title': 'Отправьте {price}',
  'shop.tgStep2Desc':
    'Оплатите удобным для вас способом. Укажите ваш email, чтобы админ знал, кому выдать роль.',
  'shop.tgStep3Title': 'Получите роль',
  'shop.tgStep3Desc':
    'После подтверждения админом роль появится у вас в профиле в течение нескольких минут.',
  'shop.openTelegram': 'Открыть Telegram · {handle}',
  'shop.notifyAdmin': 'Я оплатил — сообщить админу',
  'shop.notifying': 'Отправляем…',
  'shop.notifyHint':
    'Необязательно — создаёт заявку в админке, чтобы админ мог выдать роль одной кнопкой.',
  'shop.cancel': 'Отмена',
  'shop.requestSent': 'Заявка отправлена. Админ скоро её рассмотрит.',
  'shop.requestAlreadyPending': 'У вас уже есть заявка на эту роль.',
  'shop.statusRequested': 'Ждёт админа',
  'shop.statusGranted': 'Выдана',
  'shop.statusRejected': 'Отклонена',
  'shop.history': 'История покупок',
  'shop.historyEmpty': 'Покупок пока нет.',
  'admin.requests': 'Заявки на роли',
  'admin.requestsTab': 'Заявки',
  'admin.requestsEmpty': 'Заявок на роли нет.',
  'admin.grantRole': 'Выдать роль',
  'admin.rejectRequest': 'Отклонить',
  'admin.requestNote': 'Комментарий пользователя',
  'paywall.title': 'Нужна роль Developer',
  'paywall.developer':
    'У вас нет роли developer. Пожалуйста, купите её за $10, чтобы опубликовать свою игру.',
  'paywall.security':
    'У вас нет роли security. Пожалуйста, купите её за $20, чтобы получить доступ к модерации.',
  'paywall.buy': 'Купить в магазине',
  'nav.shop': 'Магазин',
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
  'catalog.heroEyebrow': 'Tekshirilgan · Virussiz',
  'catalog.heroTitle': "Xavotirsiz o'ynang",
  'catalog.heroSubtitle':
    "Uzisoftdagi har bir o'yin qo'lda tekshiriladi — hech qanday virus yoki shubhali o'rnatuvchilar yo'q. Tanlang, yuklab oling va o'ynang.",
  'catalog.heroBadge1': "Qo'lda tekshirilgan",
  'catalog.heroBadge2': 'Virussiz',
  'catalog.heroBadge3': "To'g'ridan-to'g'ri yuklash",
  'catalog.loading': 'Katalog yuklanmoqda…',
  'catalog.empty':
    "Hozircha o'yinlar yo'q. Keyinroq qayting — yoki birinchi o'yinni qo'shish uchun admin sifatida kiring.",
  'catalog.failed': "O'yinlarni yuklab bo'lmadi",
  'catalog.uploadedBy': 'tomonidan',
  'fps.title': 'Sizning kompyuteringizda taxminiy FPS',
  'fps.subtitle':
    "1080p uchun GPUingizga asoslangan taxmin. Haqiqiy ko'rsatkichlar CPU, RAM, drayverlar va sozlamalarga bog'liq.",
  'fps.detect': 'Mening GPU mni aniqlash',
  'fps.detecting': 'Aniqlanmoqda…',
  'fps.yourGpu': 'Aniqlangan GPU',
  'fps.pickGpu': "Yoki qo'lda klassni tanlang",
  'fps.preset.weak': "Zaif / o'rnatilgan",
  'fps.preset.entry': "Boshlang'ich (GTX 1050)",
  'fps.preset.mid': "O'rta (GTX 1660 / RTX 2060)",
  'fps.preset.high': "Yuqori (RTX 3070 / 6700 XT)",
  'fps.preset.flagship': 'Flagman (RTX 4080 / 7900 XTX)',
  'fps.lowSettings': 'Past',
  'fps.medSettings': "O'rta",
  'fps.highSettings': 'Yuqori',
  'fps.unsupported': "Aniqlab bo'lmadi — yuqorida GPU klassini tanlang.",
  'fps.not_set':
    "Bu o'yin uchun FPS bahosi sozlanmagan. Yuklovchidan GPU darajasini belgilashni so'rang.",
  'fps.note':
    "Faqat taxminiy. Haqiqiy FPS CPU, RAM, drayverlar va o'lchamga bog'liq.",
  'admin.gpuTier': 'GPU darajasi (1=yengil · 5=AAA)',
  'admin.gpuTierHint':
    "O'yin qanchalik og'ir? 1 = piksel-art / 2D · 2 = kichik 3D · 3 = ommaviy 3D (CS:GO) · 4 = o'rta AAA (GTA V) · 5 = og'ir AAA (Crysis, Cyberpunk).",
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
  'reviews.title': 'Sharhlar',
  'reviews.empty': "Hozircha sharh yo'q — birinchi bo'ling.",
  'reviews.leaveOne': 'Sharh qoldirish',
  'reviews.editYours': 'Sharhingizni yangilash',
  'reviews.rating': 'Sizning bahoyingiz',
  'reviews.textPlaceholder': "Fikringiz bilan o'rtoqlashing (ixtiyoriy)…",
  'reviews.submit': "Yuborish",
  'reviews.update': "Saqlash",
  'reviews.sending': "Yuborilmoqda…",
  'reviews.delete': "O'chirish",
  'reviews.confirmDelete': "Bu sharh o'chirilsinmi?",
  'reviews.signInToReview': "Sharh qoldirish uchun tizimga kiring.",
  'reviews.countSuffix': "sharh",
  'reviews.pickRating': "1 dan 5 gacha yulduz tanlang.",
  'reviews.loadError': "Sharhlarni yuklab bo'lmadi.",
  'reviews.submitError': "Sharhni yuborib bo'lmadi.",
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
  'role.security': 'xavfsizlik',
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
  'shop.title': "Rollar do'koni",
  'shop.subtitle':
    "Yangi imkoniyatlarni oching. Rolni tanlang, Telegram orqali to'lang — admin bir necha daqiqada rolni beradi.",
  'shop.eyebrow': 'Premium rollar',
  'shop.buy': 'Sotib olish',
  'shop.youHaveRole': 'Sizda bu rol allaqachon bor.',
  'shop.roleDeveloperName': 'Developer',
  'shop.roleSecurityName': 'Security',
  'shop.roleDeveloperDesc':
    "O'z o'yiningizni chiqaring (har bir dasturchiga 1 ta slot).",
  'shop.roleSecurityDesc':
    "Platformani moderatsiya qilishga yordam bering — o'yinlarni tekshiring, qoidabuzarlarni bloklang.",
  'shop.perkPublishGame': "Katalogga 1 ta o'yin chiqarish",
  'shop.perkDeveloperBadge': 'Profilda Developer belgisi',
  'shop.perkModerate': "O'yinlarni tasdiqlash / rad etish",
  'shop.perkBanUsers': 'Foydalanuvchilarni bloklash / blokdan chiqarish',
  'shop.perkSecurityBadge': 'Profilda Security belgisi',
  'shop.tgTitle': "Qanday to'lash",
  'shop.priceLabel': "To'lov summasi",
  'shop.tgStep1Title': 'Telegramni oching',
  'shop.tgStep1Desc': 'Adminga {handle} yozing.',
  'shop.tgStep2Title': "{price} yuboring",
  'shop.tgStep2Desc':
    "O'zingizga qulay yo'l bilan to'lang. Admin kimga rol berishini bilishi uchun emailingizni yozing.",
  'shop.tgStep3Title': 'Rolni oling',
  'shop.tgStep3Desc':
    "Admin tasdiqlagandan so'ng rol bir necha daqiqa ichida profilingizda paydo bo'ladi.",
  'shop.openTelegram': 'Telegramni ochish · {handle}',
  'shop.notifyAdmin': "To'ladim — adminga xabar bering",
  'shop.notifying': 'Yuborilmoqda…',
  'shop.notifyHint':
    "Ixtiyoriy — admin paneliga so'rov yaratadi, shunda admin bir tugma bilan rolni bera oladi.",
  'shop.cancel': 'Bekor qilish',
  'shop.requestSent': "So'rov yuborildi. Admin tez orada ko'rib chiqadi.",
  'shop.requestAlreadyPending': "Sizda bu rol uchun allaqachon so'rov bor.",
  'shop.statusRequested': 'Admin kutmoqda',
  'shop.statusGranted': 'Berildi',
  'shop.statusRejected': 'Rad etildi',
  'shop.history': 'Sotib olish tarixi',
  'shop.historyEmpty': "Hali xaridlar yo'q.",
  'admin.requests': "Rol so'rovlari",
  'admin.requestsTab': "So'rovlar",
  'admin.requestsEmpty': "Kutilayotgan rol so'rovlari yo'q.",
  'admin.grantRole': 'Rolni berish',
  'admin.rejectRequest': 'Rad etish',
  'admin.requestNote': 'Foydalanuvchi izohi',
  'paywall.title': 'Developer kirish kerak',
  'paywall.developer':
    "Sizda developer roli yo'q. O'z o'yiningizni chiqarish uchun uni $10 ga sotib oling.",
  'paywall.security':
    "Sizda security roli yo'q. Moderatsiya vositalariga kirish uchun uni $20 ga sotib oling.",
  'paywall.buy': "Do'konda sotib olish",
  'nav.shop': "Do'kon",
};

export const TRANSLATIONS: Record<Language, Dict> = { en, ru, uz };
