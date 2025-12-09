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
};

type ContainsVariable<T extends string> = `${string}{{${T}}}${string}`;
