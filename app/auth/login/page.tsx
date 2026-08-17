import { Suspense } from "react";

import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {/* LoginForm reads `?next=` via useSearchParams, which Next requires to
            sit inside a Suspense boundary. */}
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
