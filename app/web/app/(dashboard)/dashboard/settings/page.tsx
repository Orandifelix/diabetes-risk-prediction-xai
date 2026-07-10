"use client";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Sun, Moon, Monitor, LogOut, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const THEMES = [
    { value: "light",  label: "Light",  icon: Sun     },
    { value: "dark",   label: "Dark",   icon: Moon    },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="max-w-xl space-y-6">
      <PageHeader title="Settings" description="Manage your preferences." />

      {/* Theme */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-semibold text-sm mb-4">Appearance</h3>
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors ${
                theme === value
                  ? "border-primary-400 bg-primary-50 text-primary-700"
                  : "hover:bg-muted"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Units — placeholder for future */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-semibold text-sm mb-1">Units</h3>
        <p className="text-xs text-muted-foreground mb-4">
          BMI uses kg/m². Glucose uses mg/dL. These match the BRFSS dataset format.
        </p>
        <div className="rounded-lg bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
          Unit toggle coming in a future release.
        </div>
      </div>

      {/* Account */}
      <div className="rounded-xl border bg-card p-5 space-y-3">
        <h3 className="font-semibold text-sm mb-2">Account</h3>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex w-full items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete account & all data
          </button>
        ) : (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700 mb-3">
              This will permanently delete your account and all predictions. This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  toast.info("Account deletion — contact support to complete.");
                  setConfirmDelete(false);
                }}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
              >
                Yes, delete everything
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
