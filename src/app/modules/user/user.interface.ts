export interface IUser {
  username: string;
  profilePictureUrl?: string;
  email: string;
  password: string;
  isDeleted?: boolean;
}

export type SanitizedUser = Omit<IUser, 'password'> & { _id: string };
