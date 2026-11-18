import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@fusorb/facet-components";

const HomePage = lazy(() => import("./pages/HomePage.js").then((m) => ({ default: m.HomePage })));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage.js").then((m) => ({ default: m.FeedbackPage })));

export function App() {
  return (
    <>
      <Suspense fallback={<div className="flex min-h-svh items-center justify-center text-muted-foreground">Loading…</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Toaster />
    </>
  );
}
