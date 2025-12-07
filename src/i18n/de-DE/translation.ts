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
    createGameServerSuccess: "Gameserver erfolgreich erstellt!",
    createGameServerError: "Fehler beim Erstellen des Gameservers!",
  },
  deleteGameServerDialog: {
    title: "Möchten Sie {{serverName}} wirklich löschen?",
    description:
      "Diese Aktion kann nicht rückgängig gemacht werden. Dadurch wird Ihre Gameserver-Konfiguration dauerhaft gelöscht und die zugehörigen Daten von dem Server entfernt.",
    inputLabel: "Geben Sie den Namen des Gameservers ein, um sicherzugehen:",
    cancel: "Abbrechen",
    confirm: "Löschen",
  },
  aria: {
    createNewGameServer: "Erstelle eine neue Gameserver-Konfiguration",
    gameServer: "Gameserver-Konfiguration: {{serverName}}",
  },
  consequence: "asd{{counter}}ajskod",
  components: {
    CreateGameServer: {
      openButton: "Gameserver erstellen",
      backButton: "Zurück",
      nextStepButton: "Weiter",
      createServerButton: "Server erstellen",
      keyValueInputAddButton: "Hinzufügen",
      steps: {
        step1: {
          title: "Schritt 1: Spiel auswählen",
          gameSelection: {
            title: "Spiel auswählen",
            description: "Wählen Sie ein Spiel für Ihren Server aus.",
            errorLabel: "Bitte wählen Sie ein gültiges Spiel aus.",
          },
        },
        step2: {
          title: "Schritt 2: Vorlage und Name auswählen",
          description: "Wählen Sie eine Vorlage und einen Namen für Ihren Server aus.",
          templateSelection: {
            title: "Vorlage",
            description: "Wählen Sie eine Vorlage für Ihren Server aus",
            errorLabel: "Bitte wählen Sie eine gültige Vorlage aus.",
          },
          serverNameSelection: {
            title: "Servername",
            description: "Benennen Sie Ihren Server",
            errorLabel: "Bitte geben Sie einen gültigen Servernamen ein.",
          },
        },
        step3: {
          title: "Schritt 3: Konfigurieren Sie Ihren Server",
          description: "Hier können Sie Ihren Server konfigurieren.",
          dockerImageSelection: {
            title: "Docker-Image",
            description: "Docker-Image für Ihren Server",
            errorLabel: "Bitte geben Sie ein gültiges Docker-Image ein.",
          },
          imageTagSelection: {
            title: "Image-Tag",
            description: "Tag für das Docker-Image",
            errorLabel: "Bitte geben Sie ein gültiges Image-Tag ein.",
          },
          portSelection: {
            title: "Port",
            description: "Port, der zu Ihrem Server weitergeleitet wird.",
            errorLabel: "Bitte geben Sie einen gültigen Port ein.",
          },
          environmentVariablesSelection: {
            title: "Umgebungsvariable",
            description: "Umgebungsvariablen für Ihren Server",
            errorLabel:
              "Entweder müssen sowohl Schlüssel als auch Wert angegeben werden oder keiner von beiden.",
          },
          executionCommandSelection: {
            title: "Ausführungskommando",
            description: "Kommando zum Starten Ihres Servers",
            errorLabel: "Bitte geben Sie ein gültiges Ausführungskommando ein.",
          },
          hostPathSelection: {
            title: "Volume-Mount",
            description: "Volume-Mounts für Ihren Server",
            errorLabel:
              "Entweder müssen sowohl Host-Pfad als auch Container-Pfad angegeben werden oder keiner von beiden.",
          },
        },
      },
    },
  },
};

export default translation;
