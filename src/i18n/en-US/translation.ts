import type { i18nLanguage } from "@/i18n/i18nKeys";

const translation: i18nLanguage = {
  index: {
    clickCounter: "Clicks",
    clickBtn: "Click me!",
    dontClickBtn: "Don't click me!",
  },
  redirected: {
    warning: "I told you not to click!",
    consequence: "That cost you all your {{counter}} clicks!",
    noConsequence: "You didn't even have any clicks to repay your wrongdoings!",
    earnMoreClicks: "Earn some more clicks",
  },
  components: {
    CreateGameServer: {
      openButton: "Create Game Server",
      backButton: "Back",
      nextStepButton: "Next Step",
      createServerButton: "Create Server",
      steps: {
        step1: {
          title: "Create Game Server Step 1: Choose Game",
          gameSelection: {
            title: "Choose a game for your server",
            description: "Select a game to host on your server.",
            errorLabel: "Please select a valid game.",
          },
        },
        step2: {
          title: "Create Game Server Step 2: Choose Template and Name",
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
          title: "Create Game Server Step 3: Configure your Server",
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
};

export default translation;
