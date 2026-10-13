import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getDictionarySync, LOCALES, DEFAULT_LOCALE, type Locale } from "@/locales";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsAppearance } from "@/components/settings/settings-appearance";
import { SettingsSecurityForm } from "@/components/settings/settings-security-form";
import { User, Palette, Shield } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const instant = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: Locale = LOCALES.includes(locale as Locale)
    ? (locale as Locale)
    : DEFAULT_LOCALE;
  const dict = getDictionarySync(currentLocale);
  const session = await getSession();

  let dbUser: {
    id: string;
    employee_id: string | null;
    username: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
    last_login_at: string | null;
  } | null = null;

  if (session?.id) {
    try {
      const rows = await sql<
        Array<{
          id: string;
          employee_id: string | null;
          username: string;
          email: string;
          role: string;
          status: string;
          created_at: string;
          last_login_at: string | null;
        }>
      >`
        SELECT id, employee_id, username, email, role, status, created_at::text, last_login_at::text
        FROM users
        WHERE id = ${session.id}
        LIMIT 1;
      `;
      if (rows.length > 0) {
        dbUser = rows[0];
      }
    } catch (e) {
      console.error("Failed to load user profile in settings:", e);
    }
  }

  const username = dbUser?.username || session?.username || "Admin";
  const email = dbUser?.email || session?.email || "admin@example.com";
  const role = dbUser?.role || session?.role || "superadmin";
  const employeeId = dbUser?.employee_id || "EMP-001";
  const status = dbUser?.status || "active";
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {dict.settings.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {dict.settings.subtitle}
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="profile" className="gap-2">
            <User className="size-4" />
            <span>{dict.settings.tabs.profile}</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="size-4" />
            <span>{dict.settings.tabs.appearance}</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="size-4" />
            <span>{dict.settings.tabs.security}</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Content */}
        <TabsContent value="profile" className="pt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{dict.settings.profile.title}</CardTitle>
              <CardDescription>{dict.settings.profile.desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar size="lg" className="size-16 text-lg font-semibold bg-primary/10 text-primary">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{username}</h3>
                    <Badge variant={status === "active" ? "default" : "secondary"}>
                      {status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{dict.settings.profile.username}</Label>
                  <Input value={username} readOnly className="bg-muted/50 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <Label>{dict.settings.profile.email}</Label>
                  <Input value={email} readOnly className="bg-muted/50 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <Label>{dict.settings.profile.role}</Label>
                  <Input
                    value={role.toUpperCase()}
                    readOnly
                    className="bg-muted/50 cursor-not-allowed font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{dict.settings.profile.employeeId}</Label>
                  <Input value={employeeId} readOnly className="bg-muted/50 cursor-not-allowed" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Content */}
        <TabsContent value="appearance" className="pt-4">
          <SettingsAppearance
            dict={dict.settings}
            themeDict={dict.theme}
            currentLocale={currentLocale}
          />
        </TabsContent>

        {/* Security Content */}
        <TabsContent value="security" className="pt-4">
          <SettingsSecurityForm dict={dict.settings.security} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
