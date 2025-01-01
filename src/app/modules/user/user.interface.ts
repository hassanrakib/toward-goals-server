export default interface IUser {
  username: string;
  profilePictureUrl?: string;
  email: string;
  password: string;
  isDeleted?: boolean;
}
