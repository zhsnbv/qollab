import { useCompany } from '../context/CompanyContext';
import { getSettingsPreferences, updateSettingsPreferences, useSettingsPreferences } from './settingsPreferences';
import { patchChatAppearance, resolveChatAppearance } from './chatThemeCatalog';

export { DEFAULT_CHAT_APPEARANCE, BUBBLE_COLORS, CHAT_PRESETS, getChatPreset, resolveChatAppearance, patchChatAppearance, appearanceClass, appearanceStyle } from './chatThemeCatalog';

export function useChatAppearance() {
  const { company, companyId } = useCompany();
  const preferences = useSettingsPreferences();
  return {
    company, companyId, appearance: resolveChatAppearance(preferences, companyId),
    update: selection => updateSettingsPreferences(patchChatAppearance(getSettingsPreferences(), companyId, selection)),
  };
}
