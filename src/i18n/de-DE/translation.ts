import type { i18nLanguage } from "@/i18n/i18nKeys";

const translation: i18nLanguage = {
  overviewPage: {
    createNewServer: "Neuer Game Server",
  },
  rightClickMenu: {
    edit: "Bearbeiten",
    delete: "Löschen",
    refresh: "Aktualisieren",
    createNewGameserver: "Neuen Gameserver erstellen",
  },
  toasts: {
    notImplemented: "Noch nicht implementiert!",
    deleteGameServerSuccess: "Gameserver-Konfiguration erfolgreich gelöscht!",
    deleteGameServerError: "Fehler beim Löschen der Gameserver-Konfiguration!",
    refreshGameServersSuccess: "Gameserver-Konfigurationen erfolgreich aktualisiert!",
    refreshGameServersError: "Fehler beim Aktualisieren der Gameserver-Konfigurationen!",
  },
  deleteGameServerDialog: {
    title: "Möchten Sie {{serverName}} wirklich löschen?",
    description:
      "Diese Aktion kann nicht rückgängig gemacht werden. Dadurch wird Ihre Gameserver-Konfiguration dauerhaft gelöscht und die zugehörigen Daten von dem Server entfernt.",
    inputLabel: "Geben Sie den Namen des Gameservers ein, um sicherzugehen: ({{serverName}})",
    cancel: "Abbrechen",
    confirm: "Löschen",
  },
  aria: {
    createNewGameServer: "Erstelle eine neue Gameserver-Konfiguration",
    gameServer: "Gameserver-Konfiguration: {{serverName}}",
  },
  consequence: "asd{{counter}}ajskod",
};

export default translation;
