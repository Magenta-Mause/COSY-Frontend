export type i18nLanguage = {
  overviewPage: {
    createNewServer: string;
  };
  consequence: ContainsVariable<"counter">; // example
};

type ContainsVariable<T extends string> = `${string}{{${T}}}${string}`;
