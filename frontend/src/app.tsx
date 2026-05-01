import { Toaster } from "sonner";
import { AppRouter } from "@/router";

export function App() {
  return (
    <>
      <Toaster position="top-center" richColors theme="dark" />
      <AppRouter />
    </>
  );
}
