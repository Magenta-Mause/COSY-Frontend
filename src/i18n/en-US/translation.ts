import type { i18nLanguage } from "@/i18n/i18nKeys";

const translation: i18nLanguage = {
  overviewPage: {
    createNewServer: "New Game Server",
  },
  rightClickMenu: {
    edit: "Edit",
    delete: "Delete",
    refresh: "Refresh",
    createNewGameserver: "Create new Gameserver",
  },
  toasts: {
    notImplemented: "Not implemented yet!",
    deleteGameServerSuccess: "Game Server Configuration deleted successfully!",
    deleteGameServerError: "Failed to delete Game Server Configuration!",
    refreshGameServersSuccess: "Game Server Configurations refreshed successfully!",
    refreshGameServersError: "Failed to refresh Game Server Configurations!",
    createGameServerSuccess: "Game Server created successfully!",
    createGameServerError: "Failed to create Game Server!",
  },
  deleteGameServerDialog: {
    title: "Are you absolutely sure you want to delete {{serverName}}?",
    description:
      "This action cannot be undone. This will permanently delete your Game Server Configuration and remove its data from the server.",
    inputLabel: "Enter the name of the game server to be sure:",
    cancel: "Cancel",
    confirm: "Delete",
  },
  aria: {
    createNewGameServer: "Create a new Game Server Configuration",
    gameServer: "Game Server Configuration: {{serverName}}",
  },
  components: {
    CreateGameServer: {
      openButton: "Create Game Server",
      backButton: "Back",
      nextStepButton: "Next Step",
      createServerButton: "Create Server",
      keyValueInputAddButton: "Add",
      steps: {
        step1: {
          title: "Step 1: Choose Game",
          gameSelection: {
            title: "Choose a game for your server",
            description: "Select a game to host on your server.",
            errorLabel: "Please select a valid game.",
          },
        },
        step2: {
          title: "Step 2: Choose Template and Name",
          description: "Choose a template and a name for your server.",
          templateSelection: {
            title: "Template",
            description: "Select a template for your server",
            errorLabel: "Please select a valid template.",
          },
          serverNameSelection: {
            title: "Server Name",
            description: "Name your server",
            errorLabel: "Please enter a valid server name.",
          },
        },
        step3: {
          title: "Step 3: Configure your Server",
          description: "Here you can configure your server.",
          dockerImageSelection: {
            title: "Docker image",
            description: "Docker image for your server",
            errorLabel: "Please enter a valid Docker image.",
          },
          imageTagSelection: {
            title: "Image tag",
            description: "Tag for the Docker image",
            errorLabel: "Please enter a valid image tag.",
          },
          portSelection: {
            title: "Port",
            description: "Port your Server will run on",
            errorLabel: "Please enter a valid port.",
          },
          environmentVariablesSelection: {
            title: "Environment Variable",
            description: "Environment variables for your Server",
            errorLabel: "Either both key and value must be provided or neither.",
          },
          executionCommandSelection: {
            title: "Execution Command",
            description: "Command to start your server",
            errorLabel: "Please enter a valid execution command.",
          },
          hostPathSelection: {
            title: "Volume Mount",
            description: "Volume mounts for your server",
            errorLabel: "Either both host path and container path must be provided or neither.",
          },
        },
      },
    },
  },
  consequence: "asd{{counter}}ajskod",
};

export default translation;
