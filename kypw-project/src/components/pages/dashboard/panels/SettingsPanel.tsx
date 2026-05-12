"use client";

import { useState, useEffect, type FormEvent } from "react";
import {
  User, Lock, Globe, Palette, Shield, Save, Loader2, Eye, EyeOff, Droplets,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/store/auth";
import { api } from "@/lib/api/client";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatarUrl: string | null;
  bio: string | null;
  locale: string;
  preferences: string | null;
}

export function SettingsPanel() {
  const { user, setUser } = useAuth();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatarUrl: "",
    bio: "",
    locale: "en",
    preferences: "system",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await api.get<{ user: UserProfile }>("/auth/me");
        if (data.user) {
          const u = data.user;
          const prefs = u.preferences ?? "system";
          setProfile({
            name: u.name ?? "",
            email: u.email ?? "",
            avatarUrl: u.avatarUrl ?? "",
            bio: u.bio ?? "",
            locale: u.locale ?? "en",
            preferences: ["light", "dark", "system"].includes(prefs) ? prefs : "system",
          });
        }
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const data = await api.put<{ user: UserProfile }>("/users/profile", {
          name: profile.name,
          bio: profile.bio,
          avatarUrl: profile.avatarUrl,
          locale: profile.locale,
          preferences: profile.preferences,
      });
      if (user) {
        setUser({ ...user, displayName: data.user.name ?? undefined });
      }
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    if (passwords.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      await api.put("/users/password", passwords);
      toast.success("Password changed successfully");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  }

  const roleColor: Record<string, string> = {
    admin: "bg-water-deep text-white",
    coordinator: "bg-civic text-white",
    field_officer: "bg-sun text-water-deep",
    viewer: "bg-secondary text-foreground",
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription>Your personal information and avatar.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Role Badge */}
            <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-secondary/20 p-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Role:</span>
              <Badge className={roleColor[user?.role ?? "viewer"] ?? roleColor.viewer}>
                {user?.role ?? "viewer"}
              </Badge>
              <span className="text-xs text-muted-foreground ml-auto">Assigned by administrator</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="settings-name">Display Name</Label>
                <Input
                  id="settings-name"
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Your name"
                  maxLength={120}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="settings-email">Email</Label>
                <Input
                  id="settings-email"
                  value={profile.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="settings-bio">Bio</Label>
              <Input
                id="settings-bio"
                value={profile.bio}
                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                placeholder="Tell us about yourself"
                maxLength={300}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="settings-avatar">Avatar URL</Label>
              <Input
                id="settings-avatar"
                value={profile.avatarUrl}
                onChange={(e) => setProfile((p) => ({ ...p, avatarUrl: e.target.value }))}
                placeholder="https://example.com/avatar.jpg"
                maxLength={500}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" />Save Profile</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Lock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Change Password</CardTitle>
              <CardDescription>Update your account password.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pw-current">Current Password</Label>
              <div className="relative">
                <Input
                  id="pw-current"
                  type={showCurrentPw ? "text" : "password"}
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="pw-new">New Password</Label>
                <div className="relative">
                  <Input
                    id="pw-new"
                    type={showNewPw ? "text" : "password"}
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                    placeholder="Min. 6 characters"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pw-confirm">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="pw-confirm"
                    type={showConfirmPw ? "text" : "password"}
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Re-enter new password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={savingPassword}>
                {savingPassword ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Changing…</>
                ) : (
                  <><Lock className="mr-2 h-4 w-4" />Change Password</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preferences Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Droplets className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Preferences</CardTitle>
              <CardDescription>Language and appearance settings.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Locale */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Language</p>
                  <p className="text-xs text-muted-foreground">Choose your preferred language.</p>
                </div>
              </div>
              <Select
                value={profile.locale}
                onValueChange={(v) => setProfile((p) => ({ ...p, locale: v }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="sw">Kiswahili</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Appearance */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Appearance</p>
                  <p className="text-xs text-muted-foreground">Select your color scheme.</p>
                </div>
              </div>
              <Select
                value={profile.preferences}
                onValueChange={(v) => setProfile((p) => ({ ...p, preferences: v }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" />Save Preferences</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
