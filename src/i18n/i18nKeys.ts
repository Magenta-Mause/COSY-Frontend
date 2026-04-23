export type i18nLanguage = {
  common: {
    yourLimit: string;
    loading: string;
  };
  overviewPage: {
    createNewServer: string;
  };

  rightClickMenu: {
    edit: string;
    delete: string;
    startServer: string;
    stopServer: string;
    refresh: string;
    createNewGameServer: string;
    viewLogs: string;
    loading: string;
    failed: string;
    theme: string;
    themes: {
      day: string;
      night: string;
      auto: string;
      autoTooltip: string;
    };
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
    createGameServerSuccess: string;
    serverStartSuccess: string;
    serverStartError: ContainsVariable<"error">;
    serverStopSuccess: string;
    serverStopError: ContainsVariable<"error">;
    serverTransferError: string;
    updateGameServerSuccess: string;
    updateGameServerError: string;
    missingUuid: string;
    createWebhookSuccess: string;
    createWebhookError: string;
    updateWebhookSuccess: string;
    updateWebhookError: string;
    deleteWebhookSuccess: string;
    deleteWebhookError: string;
    updateFooterSuccess: string;
    updateFooterError: string;
    adminChangePasswordSuccess: string;
    adminChangePasswordError: string;
  };

  userModal: {
    title: string;
    inviteUserTitle: string;
    inviteCreatedTitle: string;
    inviteBtn: string;
    usernameLabel: string;
    usernamePlaceholder: string;
    usernameDescription: string;
    usernameErrors: {
      tooShort: string;
      tooLong: string;
      invalidCharacters: string;
    };
    cancel: string;
    generateInvite: string;
    creating: string;
    shareInstructions: string;
    copyLink: string;
    backToUsers: string;
    pendingInvites: string;
    unclaimedInvite: string;
    created: ContainsVariable<"date">;
    copyTooltip: string;
    roleLabel: string;
    editTooltip: string;
    memoryLimit: string;
    memoryDescription: string;
    cpuLimit: string;
    cpuDescription: string;
    placeholder: string;
    revoke: {
      tooltip: string;
      confirmTitle: string;
      confirmDescription: string;
      confirmAction: string;
    };
  };

  userRoles: {
    QUOTA_USER: string;
    ADMIN: string;
    OWNER: string;
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
    cpuLimit: ContainsVariable<"cpu">;
    memoryLimit: ContainsVariable<"memory">;
    passwordTooShort: string;
    passwordsDoNotMatch: string;
  };

  deleteGameServerDialog: {
    title: string;
    description: string;
    explanation: string;
    inputLabel: string;
    cancel: string;
    confirm: string;
  };

  deleteGameServerSuccessDialog: {
    title: string;
    description: string;
    confirm: string;
  };

  logOutDialog: {
    title: string;
    description: string;
    cancel: string;
    confirm: string;
  };

  userProfileModal: {
    title: string;
    usernameAndRole: string;
    role: string;
    limits: string;
    memory: string;
    cpu: string;
    changePasswordButton: string;
  };

  changePasswordModal: {
    title: string;
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
    oldPasswordPlaceholder: string;
    newPasswordPlaceholder: string;
    confirmPasswordPlaceholder: string;
    changePassword: string;
    passwordTooShort: string;
    passwordsDoNotMatch: string;
    passwordChangeSuccess: string;
    passwordChangeError: string;
    missingUuid: string;
    cancel: string;
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
    showPassword: string;
    hidePassword: string;
    question: string;
    incorrectCredentials: string;
    loading: string;
    logout: string;
  };

  optionsBanner: {
    languageSelector: string;
    userMenu: string;
    logout: string;
  };

  notificationModal: {
    successTitle: string;
    errorTitle: string;
    infoTitle: string;
    ok: string;
    dismiss: string;
  };

  logDisplay: {
    serverLog: string;
    timestampFormat: string;
    stickToBottom: string;
    enterCommand: string;
    cantSendCommands: string;
    noLogsPermission: string;
    timestampFormatDetailed: string;
    displayTimestamp: string;
  };

  serverPage: {
    notFound: string;
    notFoundGoBack: string;
    start: string;
    stop: string;
    pullingImage: string;
    status: string;
    back: string;
    dockerHardwareLimits: string;
    cpuLimit: string;
    memoryLimit: string;
    unlimited: string;
    noAccessFor: ContainsVariable<"element">;
    noStartStopPermission: string;
    navbar: {
      overview: string;
      console: string;
      metrics: string;
      file_explorer: string;
      settings: string;
    };
  };

  settings: {
    noAccessDescription: string;
    noAccessFor: ContainsVariable<"element">;
  };

  serverStatus: {
    RUNNING: string;
    STARTING: string;
    STOPPED: string;
    FAILED: string;
    PULLING_IMAGE: string;
    AWAITING_UPDATE: string;
    STOPPING: string;
  };

  filesPage: {
    loading: string;
  };

  components: {
    TemplateVariableForm: {
      title: string;
      noTemplateSelected: string;
      noVariables: string;
      selectPlaceholder: string;
      example: string;
      pattern: string;
      validationError: string;
      validationErrorRequired: string;
      validationErrorNumber: string;
      validationErrorBoolean: string;
      validationErrorSelect: string;
      validationErrorPattern: string;
      booleanTrue: string;
      booleanFalse: string;
    };
    CreateGameServer: {
      backButton: string;
      nextStepButton: string;
      useTemplate: string;
      useNoTemplate: string;
      createServerButton: string;
      reapplyDialog: {
        title: string;
        description: string;
        cancel: string;
        confirm: string;
      };
      keyValueInput: {
        escapeSequencesTooltip: string;
      };
      confirmCreateDialog: {
        title: string;
        description: string;
        cancel: string;
        confirm: string;
        creating: string;
      };
      successDialog: {
        title: string;
        description: ContainsVariable<"name">;
        completedStepLabel: string;
        doneButton: string;
        openDashboard: string;
      };
      listInput: {
        addButton: string;
      };
      steps: {
        title: string;
        step1: {
          title: string;
          serverNameSelection: {
            title: string;
            placeholder: string;
            description: string;
            errorLabel: string;
          };
          gameSelection: {
            title: string;
            description: string;
            errorLabel: string;
            placeholder: string;
            noGamesFound: string;
            noResultsLabel: string;
          };
        };
        step2: {
          title: string;
          description: string;
          noTemplatesAvailable: string;
          searchPlaceholder: string;
          requestTemplateText: string;
          requestTemplateLinkLabel: string;
          templateSelection: {
            title: string;
            description: string;
            errorLabel: string;
            noResultsLabel: string;
            placeholder: string;
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
          memoryLimitSelection: {
            title: string;
            description: string;
            errorLabel: string;
          };
          cpuLimitSelection: {
            title: string;
            description: string;
            errorLabel: string;
          };
        };
      };
      autoCompleteInputField: {
        loadingLabel: string;
        noResultsLabel: string;
      };
    };

    editGameServer: {
      title: string;
      description: string;

      revert: string;
      confirm: string;
      missingUuidError: string;
      serverNeedsToBeStopped: string;

      gameSelection: {
        title: string;
        description: string;
        errorLabel: string;
      };

      serverNameSelection: {
        title: string;
        description: string;
        errorLabel: string;
      };

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
        errorLabel: string;
        description: string;
        placeholder: {
          instancePort: string;
          containerPort: string;
          protocol: string;
        };
      };

      environmentVariablesSelection: {
        title: string;
        errorLabel: string;
        description: string;
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

      volumeMountSelection: {
        title: string;
        errorLabel: string;
        description: string;
        pathChange: {
          title: string;
          description: string;
          keepButton: string;
          deleteButton: string;
          keepIndicator: string;
          deleteIndicator: string;
        };
      };

      memoryLimitSelection: {
        title: string;
        description: string;
        errorLabel: string;
      };

      createdOn: {
        title: string;
        description: string;
      };

      cpuLimitSelection: {
        title: string;
        description: string;
        errorLabel: string;
      };
      uncosyZone: {
        title: string;
        transferOwnership: {
          title: string;
          description: string;
          button: string;
          dialog: {
            title: string;
            description: string;
            userNotFound: string;
            inputPlaceholder: string;
            confirm: string;
            cancel: string;
            inputLabel: string;
            successTitle: string;
            successMessage: string;
            close: string;
            checking: string;
          };
          confirmationDialog: {
            title: string;
            description: string;
            newOwner: string;
            confirm: string;
            cancel: string;
            transferring: string;
            transferError: string;
          };
        };
        delete: {
          title: string;
          description: string;
          button: string;
        };
      };
    };
    userManagement: {
      admin: {
        changePasswordDialog: {
          title: string;
          description: string;
          newPasswordLabel: string;
          newPasswordDescription: string;
          newPasswordPlaceholder: string;
          newPasswordError: string;
          cancelButton: string;
          confirmButton: string;
          submitError: string;
        };
        updateDockerLimitsDialog: {
          title: string;
          description: string;
          cpuLabel: string;
          cpuDescription: string;
          memoryLabel: string;
          memoryDescription: string;
          placeholder: string;
          cancelButton: string;
          confirmButton: string;
          submitError: string;
        };
        changeRoleDialog: {
          title: string;
          description: string;
          rolePlaceholder: string;
          roles: {
            admin: string;
            quota_user: string;
          };
          cancelButton: string;
          confirmButton: string;
          submitError: string;
        };
      };
      backButton: string;
      userDetailButton: {
        viewUsers: string;
      };
      userRow: {
        roles: {
          owner: string;
          admin: string;
          quota_user: string;
        };
        yourProfile: string;
        actions: {
          editPassword: string;
          editDockerLimits: string;
          editRole: string;
          deleteUser: string;
        };
        resources: {
          cpus: string;
          memory: string;
          storage: string;
          unlimited: string;
        };
        moreOptions: string;
      };
      userTable: {
        search: string;
        filter: string;
        sort: string;
        resetFilter: string;
        clearSort: string;
        sortBy: {
          username: string;
          role: string;
          docker_max_cpu_cores: string;
          docker_memory_limit: string;
        };
        noUsersFound: string;
        pendingInvites: string;
      };
      deleteUserDialog: {
        title: string;
        message: string;
        cancelButton: string;
        confirmButton: string;
        submitError: string;
      };
    };
    fileBrowser: {
      filePreview: {
        previewFailure: string;
        loadingPreview: string;
        selectPreview: string;
        noPreviewAvailable: ContainsVariable<"textError">;
      };
      fileBrowserList: {
        failedToCreateFolder: string;
        failedToRename: string;
        failedToDelete: string;
        newFolderAction: string;
        refreshAction: string;
        noFiles: string;
        directoryType: string;
        fileType: string;
        fileSizeTooltip: ContainsVariable<"size">;
        fileModeTooltip: ContainsVariable<"octal"> & ContainsVariable<"rwx">;
        renameAction: string;
        deleteAction: string;
        downloadAction: string;
        exportAction: string;
        downloadFile: ContainsVariable<"fileName">;
        createFolderAction: string;
        createFolderDescription: ContainsVariable<"dirName">;
        folderName: string;
        creatingInProgress: string;
        createAction: string;
        renameDescription: ContainsVariable<"fileName"> & ContainsVariable<"currentPath">;
        newName: string;
        renameInProgress: string;
        deleteDescription: ContainsVariable<"fileName">;
        deleteDialogFolder: string;
        deleteDialogFile: string;
        cancel: string;
        deleteInProgress: string;
        cantDeleteWhileDownloading: string;
        loading: string;
      };
      fileBrowserDialog: {
        closePreview: string;
        uploadFailure: string;
        downloadZipFailure: string;
        fileUploadError: string;
        preparing: string;
        downloadingFile: ContainsVariable<"done"> & ContainsVariable<"total">;
        downloadAllAction: string;
        uploadFile: string;
        renamePlaceholder: string;
        noFilesPermission: string;
        noFilesPermissionDesc: string;
        uploadInSyntheticDir: string;
        uploadNoPermission: string;
        errorWhileZipDownload: string;
      };
      fileBrowserHeader: {
        newFolder: string;
        refresh: string;
      };
    };
    settingsActionButtons: {
      revert: string;
      warning: string;
      confirm: string;
      cancel: string;
      saving: string;
    };
    GameServerSettings: {
      tabs: {
        general: string;
        privateDashboard: string;
        publicDashboard: string;
        metrics: string;
        accessManagement: string;
        rcon: string;
        webhooks: string;
        design: string;
      };
      sections: {
        general: string;
        privateDashboard: string;
        privateDashboardDescription: string;
        publicDashboard: string;
        publicDashboardDescription: string;
        metrics: string;
        metricsDescription: string;
        accessManagement: string;
        webhooks: string;
      };
      accessManagement: {
        title: string;
        description: string;
      };
      metrics: {
        type: string;
        width: string;
        add: string;
      };
      webhooks: {
        title: string;
        description: string;
        form: {
          webhookType: string;
          webhookUrl: string;
          enabled: string;
          subscribedEvents: string;
        };
        create: string;
        configuredWebhooks: string;
        loading: string;
        empty: string;
        delete: string;
        deleteDialog: {
          title: string;
          description: string;
        };
        labels: {
          type: string;
          url: string;
          enabled: string;
          events: string;
        };
        state: {
          enabled: string;
          disabled: string;
        };
        createSuccess: string;
        deleteSuccess: string;
        types: {
          DISCORD: string;
          SLACK: string;
          N8N: string;
        };
        events: {
          SERVER_STARTED: string;
          SERVER_STOPPED: string;
          SERVER_FAILED: string;
        };
        validation: {
          webhookUrlRequired: string;
          webhookUrlInvalid: string;
          subscribedEventsRequired: string;
        };
        cancel: string;
        creating: string;
        edit: string;
        updating: string;
        copyUrl: string;
        copied: string;
      };
      privateDashboard: {
        add: string;
        types: {
          METRIC: string;
          LOGS: string;
          FREETEXT: string;
        };
        freetext: {
          title: string;
          desc: string;
          key: string;
          value: string;
          confirm: string;
          cancel: string;
          placeholder: string;
          label: string;
          error: string;
        };
      };
      publicDashboard: {
        label: string;
        sensitiveWarning: {
          title: string;
          description: string;
          cancel: string;
          confirm: string;
        };
      };
    };
    gameServerSettings: {
      rconSettings: {
        title: string;
        description: {
          part1: string;
          part2: string;
          part3: string;
          rcon: string;
        };
        enableRcon: string;
        rconPort: {
          title: string;
          description: string;
          errorLabel: string;
        };
        rconPassword: {
          title: string;
          description: string;
          errorLabel: string;
        };
        revert: string;
        confirm: string;
      };
      designSettings: {
        title: string;
        description: string;
        house: string;
        castle: string;
        revert: string;
        confirm: string;
      };
      accessManagement: {
        title: string;
        description: string;
        createNewGroup: string;
        createGroupTitle: string;
        createGroupDescription: string;
        groupSettings: string;
        groupNameLabel: string;
        groupNamePlaceholder: string;
        groupNameRequired: string;
        groupNameAlreadyExists: string;
        members: string;
        noUsersAssigned: string;
        addUserLabel: string;
        addUserPlaceholder: string;
        addUserError: string;
        addUserButton: string;
        userAlreadyInGroup: string;
        usernameNotFound: string;
        permissions: string;
        adminNote: string;
        seeServerNote: string;
        revert: string;
        confirm: string;
        deleteGroup: string;
        deleteGroupTitle: string;
        deleteGroupDescription: ContainsVariable<"groupName">;
        cancel: string;
        delete: string;
        create: string;
        permissionDescriptions: {
          ADMIN: {
            name: string;
            description: string;
          };
          SEE_SERVER: {
            name: string;
            description: string;
          };
          READ_SERVER_SERVER_FILES: {
            name: string;
            description: string;
          };
          CHANGE_SERVER_FILES: {
            name: string;
            description: string;
          };
          CHANGE_SERVER_CONFIGS: {
            name: string;
            description: string;
          };
          CHANGE_METRICS_SETTINGS: {
            name: string;
            description: string;
          };
          CHANGE_WEBHOOK_SETTINGS: {
            name: string;
            description: string;
          };
          CHANGE_PERMISSIONS_SETTINGS: {
            name: string;
            description: string;
          };
          CHANGE_RCON_SETTINGS: {
            name: string;
            description: string;
          };
          START_STOP_SERVER: {
            name: string;
            description: string;
          };
          SEND_COMMANDS: {
            name: string;
            description: string;
          };
          READ_SERVER_LOGS: {
            name: string;
            description: string;
          };
          READ_SERVER_METRICS: {
            name: string;
            description: string;
          };
          TRANSFER_SERVER_OWNERSHIP: {
            name: string;
            description: string;
          };
          DELETE_SERVER: {
            name: string;
            description: string;
          };
          READ_SERVER_PRIVATE_DASHBOARD: {
            name: string;
            description: string;
          };
          CHANGE_PRIVATE_DASHBOARD_SETTINGS: {
            name: string;
            description: string;
          };
          CHANGE_PUBLIC_DASHBOARD_SETTINGS: {
            name: string;
            description: string;
          };
        };
      };
    };
  };

  genericModal: {
    cancel: string;
    unsavedModal: {
      title: string;
      leave: string;
      stay: string;
      saveAndLeave: string;
      saving: string;
      message: string;
    };
  };
  metrics: {
    metricDescription: ContainsVariable<"type">;
    metricDescriptionCustom: ContainsVariable<"type">;
    currentValue: ContainsVariable<"type">;
    configure: string;
    noMetricsPermission: string;
    noMetricsPermissionDesc: string;
    standardMetrics: string;
    customMetrics: string;
    noCustomMetrics: string;
    types: {
      CPU_PERCENT: string;
      MEMORY_PERCENT: string;
      MEMORY_USAGE: string;
      MEMORY_LIMIT: string;
      NETWORK_INPUT: string;
      NETWORK_OUTPUT: string;
      BLOCK_READ: string;
      BLOCK_WRITE: string;
    };
    liveMetricsOn: string;
    liveMetricsOff: string;
  };
  timerange: {
    localTime: string;
    custom: string;
    button: string;
    min: ContainsVariable<"time">;
    hour: ContainsVariable<"time">;
    day: ContainsVariable<"time">;
    apply: string;
    cancel: string;
  };
  datepicker: {
    title: string;
    des: string;
  };
  cardWidth: {
    SMALL: string;
    MEDIUM: string;
    LARGE: string;
  };
  footer: {
    title: string;
    description: string;
    contact: string;
    edit: string;
    noData: string;
    duckTooltip: string;
    editModal: {
      title: string;
      fullName: string;
      fullNamePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      phone: string;
      phonePlaceholder: string;
      street: string;
      streetPlaceholder: string;
      city: string;
      cityPlaceholder: string;
      cancel: string;
      save: string;
    };
  };
  dashboard: {
    showPublicDashboard: string;
    hidePublicDashboard: string;
  };
};

type ContainsVariable<T extends string> = `${string}{{${T}}}${string}`;
