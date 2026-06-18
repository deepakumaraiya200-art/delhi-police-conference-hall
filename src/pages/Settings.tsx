import React, { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Bell,
  Monitor,
  Info,
  Mail,
  Smartphone,
  Clock,
  Moon,
  LayoutGrid,
  Save,
  Shield,
  Building2,
  AtSign,
} from 'lucide-react';
import { useUserStore } from '@/store/userStore';

function SettingsPage() {
  const currentUser = useUserStore((state) => state.currentUser);

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [bookingReminders, setBookingReminders] = useState(true);
  const [statusChangeAlerts, setStatusChangeAlerts] = useState(false);

  // Display preferences
  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(false);

  const handleSave = () => {
    toast.success('Settings saved', {
      description: 'Your preferences have been updated successfully.',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account preferences and application settings"
      />

      <div className="max-w-3xl space-y-6">
        {/* ── Profile Section ────────────────────────────────────────────────── */}
        <Card className="">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full border border-neutral-500/30">
                <User className="w-4 h-4 " />
              </div>
              <div>
                <CardTitle className="text-base">Profile</CardTitle>
                <CardDescription className="text-xs">
                  Your account information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentUser ? (
              <>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="https://ik.imagekit.io/qwzhnpeqg/delhi%20police/Screenshot_2026-06-10_194556-removebg-preview.png" className='border rounded-full border-neutral-500/10' alt={currentUser.name} />
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                      {getInitials(currentUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">{currentUser.name}</h3>
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="w-3 h-3" />
                      {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div className="grid gap-4">
                  <div className="flex items-center gap-3">
            
              <div className="p-1.5 rounded-full border border-neutral-500/30">
                <User className="w-4 h-4 " />
              </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Full Name
                      </p>
                      <p className="text-sm font-medium">{currentUser.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    
                                  <div className="p-1.5 rounded-full border border-neutral-500/30">
                <Mail className="w-4 h-4 " />
              </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Email Address
                      </p>
                      <p className="text-sm font-medium">{currentUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                  

                                                      <div className="p-1.5 rounded-full border border-neutral-500/30">
                <Building2 className="w-4 h-4 " />
              </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Department
                      </p>
                      <p className="text-sm font-medium">{currentUser.department}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No user signed in.</p>
            )}
          </CardContent>
        </Card>

        {/* ── Notification Preferences ──────────────────────────────────────── */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full border border-neutral-500/30">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base">Notification Preferences</CardTitle>
                <CardDescription className="text-xs">
                  Control how and when you receive notifications
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-full border border-neutral-500/30">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <Label htmlFor="email-notifications" className="text-sm font-medium cursor-pointer">
                    Email Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receive booking confirmations and updates via email
                  </p>
                </div>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-full border border-neutral-500/30">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <Label htmlFor="push-notifications" className="text-sm font-medium cursor-pointer">
                    Push Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Get real-time push notifications in your browser
                  </p>
                </div>
              </div>
              <Switch
                id="push-notifications"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-full border border-neutral-500/30">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <Label htmlFor="booking-reminders" className="text-sm font-medium cursor-pointer">
                    Booking Reminders
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Get reminded 15 minutes before your meeting starts
                  </p>
                </div>
              </div>
              <Switch
                id="booking-reminders"
                checked={bookingReminders}
                onCheckedChange={setBookingReminders}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-full border border-neutral-500/30">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <Label htmlFor="status-alerts" className="text-sm font-medium cursor-pointer">
                    Room Status Change Alerts
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Be notified when a room you booked changes status
                  </p>
                </div>
              </div>
              <Switch
                id="status-alerts"
                checked={statusChangeAlerts}
                onCheckedChange={setStatusChangeAlerts}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Display Preferences ───────────────────────────────────────────── */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full border border-neutral-500/30">
                <Monitor className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base">Display Preferences</CardTitle>
                <CardDescription className="text-xs">
                  Customize the look and feel of the application
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-full border border-neutral-500/30">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <Label htmlFor="dark-mode" className="text-sm font-medium cursor-pointer">
                    Dark Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Switch to a darker color scheme for reduced eye strain
                  </p>
                </div>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={(checked) => {
                  setDarkMode(checked);
                  document.documentElement.classList.toggle('dark', checked);
                }}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-full border border-neutral-500/30">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <Label htmlFor="compact-view" className="text-sm font-medium cursor-pointer">
                    Compact View
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Reduce spacing and padding for a denser layout
                  </p>
                </div>
              </div>
              <Switch
                id="compact-view"
                checked={compactView}
                onCheckedChange={setCompactView}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── About ─────────────────────────────────────────────────────────── */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full border border-neutral-500/30">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base">About</CardTitle>
                <CardDescription className="text-xs">
                  Application version and build information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">Application</span>
                <span className="text-sm font-medium">Conference Hall Booking System</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">Version</span>
                <Badge variant="outline">v1.0.0</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">Build</span>
                <span className="text-sm font-mono text-muted-foreground">2026.06.16-prod</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">Environment</span>
                <Badge variant="secondary">Production</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">Framework</span>
                <span className="text-sm font-medium">React 19 + TypeScript</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pb-8">
          <Button onClick={handleSave} className="gap-2 px-8" size="lg">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
