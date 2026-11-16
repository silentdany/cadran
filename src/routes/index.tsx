import { createFileRoute } from "@tanstack/react-router";
import { CadranApp } from "@/components/cadran/app";
import { LocaleProvider } from "@/components/cadran/locale";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <LocaleProvider>
      <CadranApp />
    </LocaleProvider>
  );
}
