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
    createGameServerSuccess: string;
    createGameServerError: string;
  };
  deleteGameServerDialog: {
    title: ContainsVariable<"serverName">;
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
  consequence: ContainsVariable<"counter">; // example

  components: {
    CreateGameServer: {
      backButton: string;
      nextStepButton: string;
      createServerButton: string;
      keyValueInputAddButton: string;
      steps: {
        step1: {
          title: string;
          gameSelection: {
            title: string;
            description: string;
            errorLabel: string;
          };
        };
        step2: {
          title: string;
          description: string;
          templateSelection: {
            title: string;
            description: string;
            errorLabel: string;
          };
          serverNameSelection: {
            title: string;
            description: string;
            errorLabel: string;
          };
        };
        step3: {
          title: string;
          description: string;
          dockerImageSelection: {
            title: string;
            description: string;
            errorLabel: string;
          };
          imageTagSelection: {
            title: string;
            description: string;
            errorLabel: string;
          };
          portSelection: {
            title: string;
            description: string;
            errorLabel: string;
          };
          environmentVariablesSelection: {
            title: string;
            description: string;
            errorLabel: string;
          };
          executionCommandSelection: {
            title: string;
            description: string;
            errorLabel: string;
          };
          hostPathSelection: {
            title: string;
            description: string;
            errorLabel: string;
          };
        };
      };
    };
  };
};

type ContainsVariable<T extends string> = `${string}{{${T}}}${string}`;
