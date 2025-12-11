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
    inviteCreatedSuccess: "Einladung erfolgreich erstellt",
    inviteCreateError: 'Fehler beim Erstellen der Einladung. "{{error}}"',
    inviteRevokedSuccess: "Einladung widerrufen",
    inviteRevokeError: "Fehler beim Widerrufen der Einladung",
    copyClipboardSuccess: "Link in die Zwischenablage kopiert",
    passwordsDoNotMatch: "Passwörter stimmen nicht überein",
    usernameRequired: "Benutzername ist erforderlich",
    accountCreatedSuccess:
      "Konto erfolgreich erstellt! Melde dich jetzt an, um dein Profil zu erstellen.",
    accountCreateError: 'Fehler beim Erstellen des Kontos. "{{error}}"',
  },
  userModal: {
    title: "Benutzer",
    inviteUserTitle: "Benutzer einladen",
    inviteCreatedTitle: "Einladung erstellt",
    inviteBtn: "Einladen",
    usernameLabel: "Benutzername (Optional)",
    usernamePlaceholder: "Benutzername eingeben...",
    usernameDescription: "Leer lassen, damit der Benutzer seinen eigenen Namen wählen kann.",
    cancel: "Abbrechen",
    generateInvite: "Einladung erstellen",
    creating: "Erstelle...",
    shareInstructions:
      "Teilen Sie diesen Link mit der Person, die Sie einladen möchten. Sie kann ihn nutzen, um ihr Konto zu erstellen.",
    copyLink: "Einladungslink kopieren",
    backToUsers: "Zurück zu Benutzern",
    pendingInvites: "Ausstehende Einladungen",
    unclaimedInvite: "Nicht beanspruchte Einladung",
    created: "Erstellt: {{date}}",
    revokeTooltip: "Einladung widerrufen",
    copyTooltip: "Klicken zum Kopieren",
  },
  inviteRedemption: {
    title: "Einladung annehmen",
    description: "Erstellen Sie Ihr Konto, um dem Server Yard beizutreten.",
    invalidLink: "Ungültiger oder abgelaufener Einladungslink.",
    close: "Schließen",
    invitedBy: "Eingeladen von {{username}}",
    usernameLabel: "Benutzername",
    usernamePlaceholder: "Benutzername wählen",
    usernameSetByInviter: "* Benutzername vom Einladenden festgelegt",
    passwordLabel: "Passwort",
    passwordPlaceholder: "Passwort",
    confirmPasswordLabel: "Passwort bestätigen",
    confirmPasswordPlaceholder: "Passwort",
    cancel: "Abbrechen",
    createAccount: "Konto erstellen",
    creating: "Erstelle...",
    loginSuccess: "Erfolgreich eingeloggt",
    loginInfo: "Bitte loggen Sie sich mit Ihrem neuen Konto ein.",
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
  signIn: {
    signIn: "Anmelden",
    desc: "C.O.S.Y. - Cost Optimized Server Yard",
    username: "Benutzername",
    password: "Passwort",
    resetPassword: "Passwort vergessen?",
    question: "Du bist nicht angemeldet",
    continueMeansAccept: "Durch die Anmeldung akzeptieren Sie unsere",
    legal: "Datenschutzerklärung",
    incorrectCredentials: "Falscher Benutzername oder Passwort.",
    loading: "Lädt...",
    logout: "Abmelden",
  },
  consequence: "asd{{counter}}ajskod",
  components: {
    CreateGameServer: {
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
