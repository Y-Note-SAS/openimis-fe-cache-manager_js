import CacheMainMenu from "./menus/CacheMainMenu";
import messages_en from "./translations/en.json";
import CachingDashboardPage from "./pages/CachingDashboardPage";

const CACHING_DASHBOARD = "cache_dashboard/dashboard"

const DEFAULT_CONFIG = {
  "translations": [{ key: "en", messages: messages_en }],
  "core.MainMenu": [CacheMainMenu],
  "core.Router": [
   { path: CACHING_DASHBOARD, component: CachingDashboardPage},
  ]
}

export const CacheModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
}