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
  },
  deleteGameServerDialog: {
    title: "Are you absolutely sure you want to delete {{serverName}}?",
    description:
      "This action cannot be undone. This will permanently delete your Game Server Configuration and remove its data from the server.",
    inputLabel: "Enter the name of the game server to be sure: ({{serverName}})",
    cancel: "Cancel",
    confirm: "Delete",
  },
  aria: {
    createNewGameServer: "Create a new Game Server Configuration",
    gameServer: "Game Server Configuration: {{serverName}}",
  },
  consequence: "asd{{counter}}ajskod",
};

export default translation;
