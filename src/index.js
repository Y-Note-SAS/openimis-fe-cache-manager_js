import messages_en from "./translations/en.json";
import messages_fr from "./translations/fr.json";
import CachingDashboardPage from "./pages/CachingDashboardPage";

const CACHING_DASHBOARD = "cache/dashboard"

const DEFAULT_CONFIG = {
  "translations": [{ key: "en", messages: messages_en }, {key: "fr", messages: messages_fr}],
  "core.Router": [
   { path: CACHING_DASHBOARD, component: CachingDashboardPage},
  ]
}

export const CacheModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
}