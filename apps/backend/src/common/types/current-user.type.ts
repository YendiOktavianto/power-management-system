import { UserRole } from '../../database/entities/user.entity';

export type CurrentUserData = {
  userId: string;
  email: string;
  role: UserRole;
};
