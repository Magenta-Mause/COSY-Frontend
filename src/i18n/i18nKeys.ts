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
  consequence: ContainsVariable<"counter">; // example

  components: {
    CreateGameServer: {
      openButton: string;
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
