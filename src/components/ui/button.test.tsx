import { cleanup, render, screen } from "@testing-library/react";
import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import enUS from "@/i18n/en-US/translation";
import { Button } from "./button";

// Standalone i18n instance: the app's `src/i18n/i18n.ts` wires up the browser
// language detector, which would make the rendered labels depend on the
// environment. Here the language is pinned so the assertions are exact.
beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    resources: { en: { translation: enUS } },
    interpolation: { escapeValue: false },
  });
});

afterEach(cleanup);

// jest-dom is not part of the toolchain, so assertions go through plain DOM state.
const renderButton = (ui: React.ReactElement) =>
  render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);

describe("Button", () => {
  it("renders its children when idle", () => {
    renderButton(<Button>Save</Button>);

    const button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.textContent).toBe("Save");
    expect(button.disabled).toBe(false);
    expect(button.getAttribute("aria-busy")).toBeNull();
    expect(button.getAttribute("data-loading")).toBeNull();
  });

  it("swaps the children for loadingLabel while loading", () => {
    renderButton(
      <Button loading loadingLabel="Saving...">
        Save
      </Button>,
    );

    expect(screen.getByRole("button").textContent).toBe("Saving...");
  });

  it("falls back to common.loading when no loadingLabel is given", () => {
    renderButton(<Button loading>Save</Button>);

    expect(screen.getByRole("button").textContent).toBe(enUS.common.loading);
  });

  it("disables the button and marks it busy while loading", () => {
    renderButton(<Button loading>Save</Button>);

    const button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.getAttribute("data-loading")).toBe("true");
  });

  it("leaves the child untouched under asChild, since Slot needs Children.only", () => {
    renderButton(
      <Button asChild loading loadingLabel="Saving...">
        <a href="/somewhere">Go</a>
      </Button>,
    );

    const link = screen.getByRole("link");
    expect(link.textContent).toBe("Go");
    expect(link.getAttribute("aria-busy")).toBe("true");
  });

  it("keeps the icon on icon-only sizes instead of rendering a text label", () => {
    renderButton(
      <Button size="icon" loading>
        <svg aria-hidden="true" />
      </Button>,
    );

    const button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.textContent).toBe("");
    expect(button.querySelector("svg")).not.toBeNull();
    expect(button.disabled).toBe(true);
  });
});
