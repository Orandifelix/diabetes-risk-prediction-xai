import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageBackLinkProps {
  href: string;
  label: string;
}

export default function PageBackLink({
  href,
  label,
}: PageBackLinkProps) {
  return (
    <Link
      href={href}
      className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}