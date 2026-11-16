import { createFileRoute } from "@tanstack/react-router";
import { CadranApp } from "@/components/cadran/app";
import { LocaleProvider } from "@/components/cadran/locale";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/en")({
  head: () => pageHead("en"),
  component: () => (
    <LocaleProvider locale="en">
      <CadranApp />
    </LocaleProvider>
  ),
});
