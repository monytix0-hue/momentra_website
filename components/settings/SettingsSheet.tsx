"use client";

import { useEffect, useRef, useState } from "react";
import { UserAvatar } from "@/components/profile/UserAvatar";
import {
  confirmAvatarUpload,
  deleteAccount,
  logoutAll,
  putToSignedUrl,
  requestAvatarUploadUrl,
  updateProfile,
} from "@/lib/api/client";
import type { UserResponse } from "@/lib/api/types";
import { prepareAvatarFile } from "@/lib/avatarUpload";
import { AvatarPhotoEditor } from "@/components/settings/AvatarPhotoEditor";
import { MoneyRegionSection } from "@/components/settings/MoneyRegionSection";
import { PersonalPrefsSection } from "@/components/settings/PersonalPrefsSection";
import { getBootstrap } from "@/stores/bootstrapStore";
import type {
  BootstrapPersonalPreferences,
  BootstrapPreferences,
} from "@/lib/api/bootstrapTypes";
import {
  changePassword,
  getFirebaseAuth,
  isEmailPasswordUser,
  updateFirebaseDisplayName,
} from "@/lib/firebase";
import { useThemeTokens } from "@/components/theme/AppContextProvider";
import {
  SettingsPrimaryButton,
  SettingsSecondaryButton,
  SettingsSectionShell,
  settingsFieldStyle,
} from "@/components/settings/settingsUi";

type SettingsSheetProps = {
  user: UserResponse;
  isLoading: boolean;
  onClose: () => void;
  onSignOut: () => void;
  onUserUpdated: (user: UserResponse) => void;
  onViewIntro?: () => void;
};

type Section =
  | "hub"
  | "profile"
  | "money"
  | "personal"
  | "notifications"
  | "security"
  | "about"
  | "danger";

export function SettingsSheet({
  user,
  isLoading,
  onClose,
  onSignOut,
  onUserUpdated,
  onViewIntro,
}: SettingsSheetProps) {
  const { colors, radius } = useThemeTokens();
  const field = settingsFieldStyle(colors, radius);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [section, setSection] = useState<Section>("hub");
  const [displayName, setDisplayName] = useState(user.display_name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [uploading, setUploading] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSuccess, setNameSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [canChangePassword, setCanChangePassword] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [currencyPrefs, setCurrencyPrefs] = useState<BootstrapPreferences | null>(
    () => getBootstrap()?.preferences ?? null,
  );
  const [personalPrefs, setPersonalPrefs] =
    useState<BootstrapPersonalPreferences | null>(
      () => getBootstrap()?.personal_preferences ?? null,
    );
  const [sessionBusy, setSessionBusy] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(user.display_name ?? "");
  }, [user.display_name]);

  useEffect(() => {
    setCanChangePassword(isEmailPasswordUser(getFirebaseAuth().currentUser));
  }, []);

  useEffect(() => {
    setCurrencyPrefs(getBootstrap()?.preferences ?? null);
    setPersonalPrefs(getBootstrap()?.personal_preferences ?? null);
  }, []);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploadError(null);
    setPendingFile(file);
  }

  async function handleConfirmAvatar(rotationDegrees: number) {
    if (!pendingFile) return;
    setUploading(true);
    setUploadError(null);
    try {
      const prepared = await prepareAvatarFile(pendingFile, rotationDegrees);
      const upload = await requestAvatarUploadUrl("image/jpeg", prepared.size);
      await putToSignedUrl(upload.upload_url, prepared, "image/jpeg");
      const updated = await confirmAvatarUpload(upload.storage_path);
      onUserUpdated(updated);
      setPendingFile(null);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSaveDisplayName() {
    const trimmed = displayName.trim();
    if (!trimmed) {
      setNameError("Display name cannot be empty");
      return;
    }
    setSavingName(true);
    setNameError(null);
    setNameSuccess(null);
    try {
      await updateFirebaseDisplayName(trimmed);
      const updated = await updateProfile(trimmed);
      onUserUpdated(updated);
      setNameSuccess("Display name saved");
    } catch (err) {
      setNameError(err instanceof Error ? err.message : "Could not save name");
    } finally {
      setSavingName(false);
    }
  }

  async function handleChangePassword() {
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(null);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Password updated");
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Could not change password",
      );
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleLogoutAll() {
    setSessionBusy(true);
    setSessionError(null);
    try {
      await logoutAll();
      onSignOut();
    } catch (err) {
      setSessionError(
        err instanceof Error ? err.message : "Could not sign out all devices",
      );
      setSessionBusy(false);
    }
  }

  async function handleDeleteAccount() {
    const expected = (user.email || user.display_name || "").trim();
    if (!expected || deleteConfirm.trim() !== expected) {
      setDeleteError(
        user.email
          ? "Type your email to confirm"
          : "Type your display name to confirm",
      );
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      onSignOut();
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Could not delete account",
      );
      setDeleting(false);
    }
  }

  const busy =
    isLoading ||
    uploading ||
    savingName ||
    changingPassword ||
    sessionBusy ||
    deleting;

  const hubRows: { id: Section; label: string; hint: string }[] = [
    { id: "profile", label: "Profile", hint: "Photo, name, email" },
    { id: "money", label: "Money & region", hint: "Currency, locale, timezone" },
    {
      id: "personal",
      label: "Personal preferences",
      hint: "Week start, privacy mode",
    },
    { id: "notifications", label: "Notifications", hint: "Reminders & summaries" },
    { id: "security", label: "Security", hint: "Password & sessions" },
    { id: "about", label: "About", hint: "Intro & version" },
    { id: "danger", label: "Delete account", hint: "Permanently close account" },
  ];

  return (
    <>
      {pendingFile ? (
        <AvatarPhotoEditor
          file={pendingFile}
          isUploading={uploading}
          uploadError={uploadError}
          onCancel={() => {
            if (!uploading) {
              setPendingFile(null);
              setUploadError(null);
            }
          }}
          onConfirm={handleConfirmAvatar}
        />
      ) : null}

      <div
        className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
        style={{ background: "rgba(0,0,0,0.55)" }}
      >
        <div
          className="max-h-[90vh] w-full max-w-md overflow-y-auto p-6 sm:rounded-2xl"
          style={{
            background: colors.surface,
            color: colors.textPrimary,
            borderRadius: radius.xl,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                className="text-lg font-semibold"
                style={{ color: colors.textPrimary }}
              >
                Settings
              </h2>
              <p className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
                Account and app preferences
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-sm"
              style={{ color: colors.textSubtle }}
            >
              Close
            </button>
          </div>

          <div className="mt-6">
            {section === "hub" ? (
              <div className="space-y-2">
                <div className="mb-4 flex items-center gap-3">
                  <UserAvatar
                    photoUrl={user.photo_url}
                    displayName={user.display_name}
                    email={user.email}
                    size={48}
                  />
                  <div className="min-w-0">
                    <p
                      className="truncate text-sm font-medium"
                      style={{ color: colors.textPrimary }}
                    >
                      {user.display_name || "Your account"}
                    </p>
                    {user.email ? (
                      <p
                        className="truncate text-xs"
                        style={{ color: colors.textSubtle }}
                      >
                        {user.email}
                      </p>
                    ) : null}
                  </div>
                </div>

                {hubRows.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => setSection(row.id)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                    style={{
                      background: colors.surfaceElevated,
                      borderRadius: radius.md,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <span>
                      <span
                        className="block text-sm font-medium"
                        style={{
                          color:
                            row.id === "danger" ? colors.error : colors.textPrimary,
                        }}
                      >
                        {row.label}
                      </span>
                      <span
                        className="block text-xs"
                        style={{ color: colors.textSubtle }}
                      >
                        {row.hint}
                      </span>
                    </span>
                    <span style={{ color: colors.textSubtle }}>›</span>
                  </button>
                ))}

                <div className="pt-2">
                  <SettingsSecondaryButton disabled={busy} onClick={onSignOut}>
                    Sign out
                  </SettingsSecondaryButton>
                </div>
              </div>
            ) : null}

            {section === "profile" ? (
              <SettingsSectionShell
                title="Profile"
                subtitle="Photo and display name"
                onBack={() => setSection("hub")}
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <UserAvatar
                    photoUrl={user.photo_url}
                    displayName={user.display_name}
                    email={user.email}
                    size={72}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <SettingsSecondaryButton
                    disabled={busy}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? "Uploading…" : "Change photo"}
                  </SettingsSecondaryButton>
                  {uploadError ? (
                    <p className="text-sm" style={{ color: colors.error }}>
                      {uploadError}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    className="text-sm font-medium"
                    style={{ color: colors.textSecondary }}
                  >
                    Display name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    style={{ ...field, marginTop: 4 }}
                    disabled={busy}
                  />
                  <div className="mt-2">
                    <SettingsPrimaryButton
                      disabled={busy}
                      onClick={() => void handleSaveDisplayName()}
                    >
                      {savingName ? "Saving…" : "Save name"}
                    </SettingsPrimaryButton>
                  </div>
                  {nameError ? (
                    <p className="mt-1 text-sm" style={{ color: colors.error }}>
                      {nameError}
                    </p>
                  ) : null}
                  {nameSuccess ? (
                    <p className="mt-1 text-sm" style={{ color: colors.success }}>
                      {nameSuccess}
                    </p>
                  ) : null}
                </div>

                {user.email ? (
                  <div>
                    <label
                      className="text-sm font-medium"
                      style={{ color: colors.textSecondary }}
                    >
                      Email
                    </label>
                    <p
                      className="mt-1 px-3 py-2 text-sm"
                      style={{
                        ...field,
                        opacity: 0.85,
                      }}
                    >
                      {user.email}
                    </p>
                  </div>
                ) : null}
              </SettingsSectionShell>
            ) : null}

            {section === "money" && currencyPrefs ? (
              <MoneyRegionSection
                preferences={currencyPrefs}
                onPreferencesUpdated={setCurrencyPrefs}
                onBack={() => setSection("hub")}
              />
            ) : null}

            {section === "personal" ? (
              <PersonalPrefsSection
                mode="personal"
                initial={personalPrefs}
                onUpdated={(p) =>
                  setPersonalPrefs({
                    preference_id: p.preference_id,
                    user_id: p.user_id,
                    week_start_day: p.week_start_day ?? "MONDAY",
                    notification_enabled: p.notification_enabled,
                    quick_add_reminder_enabled: p.quick_add_reminder_enabled,
                    daily_summary_enabled: p.daily_summary_enabled,
                    privacy_mode_enabled: p.privacy_mode_enabled,
                    preferred_summary_time: p.preferred_summary_time,
                    default_account_id: p.default_account_id,
                  })
                }
                onBack={() => setSection("hub")}
              />
            ) : null}

            {section === "notifications" ? (
              <PersonalPrefsSection
                mode="notifications"
                initial={personalPrefs}
                onUpdated={(p) =>
                  setPersonalPrefs({
                    preference_id: p.preference_id,
                    user_id: p.user_id,
                    week_start_day: p.week_start_day ?? "MONDAY",
                    notification_enabled: p.notification_enabled,
                    quick_add_reminder_enabled: p.quick_add_reminder_enabled,
                    daily_summary_enabled: p.daily_summary_enabled,
                    privacy_mode_enabled: p.privacy_mode_enabled,
                    preferred_summary_time: p.preferred_summary_time,
                    default_account_id: p.default_account_id,
                  })
                }
                onBack={() => setSection("hub")}
              />
            ) : null}

            {section === "security" ? (
              <SettingsSectionShell
                title="Security"
                subtitle="Password and device sessions"
                onBack={() => setSection("hub")}
              >
                {canChangePassword ? (
                  <div className="space-y-2">
                    <p
                      className="text-sm font-medium"
                      style={{ color: colors.textSecondary }}
                    >
                      Change password
                    </p>
                    <input
                      type="password"
                      placeholder="Current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      style={field}
                      disabled={busy}
                      autoComplete="current-password"
                    />
                    <input
                      type="password"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={field}
                      disabled={busy}
                      autoComplete="new-password"
                    />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={field}
                      disabled={busy}
                      autoComplete="new-password"
                    />
                    <SettingsPrimaryButton
                      disabled={busy}
                      onClick={() => void handleChangePassword()}
                    >
                      {changingPassword ? "Updating…" : "Update password"}
                    </SettingsPrimaryButton>
                    {passwordError ? (
                      <p className="text-sm" style={{ color: colors.error }}>
                        {passwordError}
                      </p>
                    ) : null}
                    {passwordSuccess ? (
                      <p className="text-sm" style={{ color: colors.success }}>
                        {passwordSuccess}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: colors.textSubtle }}>
                    Password changes are available for email/password accounts.
                  </p>
                )}

                <SettingsSecondaryButton
                  disabled={busy}
                  onClick={() => void handleLogoutAll()}
                >
                  {sessionBusy ? "Signing out…" : "Sign out all devices"}
                </SettingsSecondaryButton>
                {sessionError ? (
                  <p className="text-sm" style={{ color: colors.error }}>
                    {sessionError}
                  </p>
                ) : null}
              </SettingsSectionShell>
            ) : null}

            {section === "about" ? (
              <SettingsSectionShell
                title="About"
                subtitle="Product intro and version"
                onBack={() => setSection("hub")}
              >
                {onViewIntro ? (
                  <SettingsSecondaryButton onClick={onViewIntro}>
                    View intro
                  </SettingsSecondaryButton>
                ) : null}
                <p className="text-xs" style={{ color: colors.textSubtle }}>
                  Momentra
                </p>
              </SettingsSectionShell>
            ) : null}

            {section === "danger" ? (
              <SettingsSectionShell
                title="Delete account"
                subtitle="This soft-deletes your account and signs you out everywhere"
                onBack={() => setSection("hub")}
              >
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  Type{" "}
                  <strong style={{ color: colors.textPrimary }}>
                    {user.email || user.display_name || "your name"}
                  </strong>{" "}
                  to confirm.
                </p>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  style={field}
                  disabled={busy}
                  placeholder={user.email || user.display_name || ""}
                />
                {deleteError ? (
                  <p className="text-sm" style={{ color: colors.error }}>
                    {deleteError}
                  </p>
                ) : null}
                <SettingsPrimaryButton
                  danger
                  disabled={busy}
                  onClick={() => void handleDeleteAccount()}
                >
                  {deleting ? "Deleting…" : "Delete my account"}
                </SettingsPrimaryButton>
              </SettingsSectionShell>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
