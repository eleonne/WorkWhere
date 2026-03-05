import type { UserInfo } from '../../services/auth-api'
import styles from './user-badge.module.css'

type Props = {
  user: UserInfo
}

export const UserBadge = ({ user }: Props) => {
  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div className={styles.badge} title={user.email}>
      <span className={styles.avatar}>{initials}</span>
      <span className={styles.name}>{user.name}</span>
    </div>
  )
}
