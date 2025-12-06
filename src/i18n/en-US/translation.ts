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
    inputLabel: "Enter the name of the game server to be sure:",
    cancel: "Cancel",
    confirm: "Delete",
  },
  aria: {
    createNewGameServer: "Create a new Game Server Configuration",
    gameServer: "Game Server Configuration: {{serverName}}",
  },
  signIn: {
    signIn: "Sign In",
    desc: "C.O.S.Y. - Cost Optimized Server Yard",
    username: "Username",
    password: "Password",
    resetPassword: "Forgot Password?",
    question: "You are not signed in",
    continueMeansAccept: "By signing in, you accept our",
    legal: "Privacy Policy",
    incorrectCredentials: "Incorrect username or password.",
    loading: "Loading...",
  },
};

export default translation;
