import { Button } from "@components/ui/button";
import { DialogTitle } from "@components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@components/ui/field";
import { Input } from "@components/ui/input";
import { useForm } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as z from "zod";
import FormInput from "../FormInput";

const formSchema = z.object({
  game: z.string().min(1, "Please select a game."),
});

export default function Step1() {
  const { t } = useTranslation();

  const form = useForm({
    defaultValues: {
      game: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      toast.success("Form submitted successfully");
    },
  });

  return (
    <>
      <DialogTitle>{t("components.CreateGameServer.steps.step1.title")}</DialogTitle>
      <div className="my-4 space-y-2">
        <form
          id="game-creation-step1-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <FieldSet>
              <FormInput
                form={form as any}
                placeholder={t("components.CreateGameServer.steps.step1.gameSelection.placeholder")}
                title={t("components.CreateGameServer.steps.step1.gameSelection.title")}
                description={t("components.CreateGameServer.steps.step1.gameSelection.description")}
                fieldName="game"
              />
              {/* <form.Field name="game">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field>
                      <FieldLabel htmlFor="game-selection">
                        {t("components.CreateGameServer.steps.step1.gameSelection.title")}
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Select a game"
                      />
                      <FieldDescription>
                        {t("components.CreateGameServer.steps.step1.gameSelection.description")}
                      </FieldDescription>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </form.Field> */}
            </FieldSet>
          </FieldGroup>
        </form>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" form="game-creation-step1-form">
            Submit
          </Button>
        </Field>
      </div>
    </>
  );
}
