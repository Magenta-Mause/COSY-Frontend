export type i18nLanguage = {
  overviewPage: {
    createNewServer: string;
  };
  rightClickMenu: {
    edit: string;
    delete: string;
    refresh: string;
    createNewGameserver: string;
  };
  toasts: {
    notImplemented: string;
    deleteGameServerSuccess: string;
    deleteGameServerError: string;
    refreshGameServersSuccess: string;
    refreshGameServersError: string;
    inviteCreatedSuccess: string;
    inviteCreateError: ContainsVariable<"error">;
    inviteRevokedSuccess: string;
    inviteRevokeError: string;
    copyClipboardSuccess: string;
    passwordsDoNotMatch: string;
    usernameRequired: string;
    accountCreatedSuccess: string;
    accountCreateError: ContainsVariable<"error">;
  };
  userModal: {
    title: string;
    inviteUserTitle: string;
    inviteCreatedTitle: string;
    inviteBtn: string;
    usernameLabel: string;
    usernamePlaceholder: string;
    usernameDescription: string;
    cancel: string;
    generateInvite: string;
    creating: string;
    shareInstructions: string;
    copyLink: string;
    backToUsers: string;
    pendingInvites: string;
    unclaimedInvite: string;
    created: ContainsVariable<"date">;
    revokeTooltip: string;
    copyTooltip: string;
  };
  inviteRedemption: {
    title: string;
    description: string;
    invalidLink: string;
    close: string;
    invitedBy: ContainsVariable<"username">;
    usernameLabel: string;
    usernamePlaceholder: string;
    usernameSetByInviter: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    confirmPasswordLabel: string;
    confirmPasswordPlaceholder: string;
    cancel: string;
    createAccount: string;
    creating: string;
    loginSuccess: string;
    loginInfo: string;
  };
  deleteGameServerDialog: {
    title: ContainsVariable<"serverName">;
    subheader: string;
    description: string;
    inputLabel: string;
    cancel: string;
    confirm: string;
  };
  aria: {
    createNewGameServer: string;
    gameServer: ContainsVariable<"serverName">;
  };
  signIn: {
    signIn: string;
    desc: string;
    username: string;
    password: string;
    resetPassword: string;
    question: string;
    continueMeansAccept: string;
    legal: string;
    incorrectCredentials: string;
    loading: string;
    logout: string;
  };
  genericModal: {
    cancel: string;
  };
};

type ContainsVariable<T extends string> = `${string}{{${T}}}${string}`;
