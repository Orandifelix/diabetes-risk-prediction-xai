import Link from "next/link";
import { Activity } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 mb-6">
        <Activity className="h-8 w-8 text-primary-500" />
      </div>
      <h1 className="font-display text-4xl font-bold mb-2">Page not found</h1>
      <p className="text-muted-foreground mb-8 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-primary-500 px-6 py-2.5 font-medium text-white hover:bg-primary-600 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
