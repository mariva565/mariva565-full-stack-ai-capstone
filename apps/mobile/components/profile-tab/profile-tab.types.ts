export type ProfileUser = {
  id: number;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
};

export type ProfileTabViewModel = {
  profile: ProfileUser | null;
  initials: string;
  editName: string;
  editing: boolean;
  loading: boolean;
  refreshing: boolean;
  error: string;
  saving: boolean;
  retry: () => void;
  refresh: () => void;
  setEditName: (value: string) => void;
  startEditing: () => void;
  cancelEditing: () => void;
  saveProfile: () => void;
  logout: () => void;
};
