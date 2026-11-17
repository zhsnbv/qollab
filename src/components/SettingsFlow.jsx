import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import SettingsRouteStack from './SettingsRouteStack';
import { isSettingsLocation } from '../utils/settingsNavigation';
import Settings from '../screens/Settings';
import { AppearanceSettings, QuickReactionSettings, ChatThemeSettings, BubbleColorSettings, WallpaperSettings, LanguageSettings, StorageSettings, DeviceDetailsSettings } from '../screens/SettingsExperience';
import { NotificationSettings, Devices, Permissions, Privacy } from '../screens/SettingsPages';

function renderSettingsLocation(location) {
  return <Routes location={location}>
    <Route path="/settings" element={<Settings />} />
    <Route path="/settings/appearance" element={<AppearanceSettings />} />
    <Route path="/settings/reaction" element={<QuickReactionSettings />} />
    <Route path="/settings/chat-theme" element={<ChatThemeSettings />} />
    <Route path="/settings/bubbles" element={<BubbleColorSettings />} />
    <Route path="/settings/wallpaper" element={<WallpaperSettings />} />
    <Route path="/settings/language" element={<LanguageSettings />} />
    <Route path="/settings/storage" element={<StorageSettings />} />
    <Route path="/settings/device" element={<DeviceDetailsSettings />} />
    <Route path="/settings/notifications" element={<NotificationSettings />} />
    <Route path="/settings/devices" element={<Devices />} />
    <Route path="/settings/permissions" element={<Permissions />} />
    <Route path="/settings/help" element={<DeviceDetailsSettings />} />
    <Route path="/settings/help/device" element={<DeviceDetailsSettings />} />
    <Route path="/settings/privacy" element={<Privacy />} />
    <Route path="*" element={<Settings />} />
  </Routes>;
}

// An isolated settings flow for review/Storybook, inside their existing router.
// Their root Back stays in settings, matching the previous review fallback;
// the real application uses its full route renderer and returns to Profile.
export default function SettingsFlow({ onRoute }) {
  const location = useLocation();
  const effectiveLocation = isSettingsLocation(location) ? location : { ...location, pathname: '/settings', state: null };
  useEffect(() => { onRoute?.(effectiveLocation.pathname); }, [effectiveLocation.pathname, onRoute]);
  return <SettingsRouteStack location={effectiveLocation} renderLocation={renderSettingsLocation} />;
}
