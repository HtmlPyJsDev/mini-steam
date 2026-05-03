import { useTranslation } from '../i18n/I18nContext';
import type { UserRole } from '../types';

export function RolePill({ role }: { role: UserRole }) {
  const { t } = useTranslation();
  const label =
    role === 'admin' ? t('role.admin') : role === 'developer' ? t('role.developer') : t('role.user');
  return <span className={`role-pill role-pill--${role}`}>{label}</span>;
}
