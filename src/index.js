import messages_en from "./translations/en.json";
import messages_fr from "./translations/fr.json";
import CachesPage from "./pages/CachesPage";
import CacheModelPicker from "./pickers/CacheModelPicker";
import reducer from "./reducer";

const CACHING_DASHBOARD = "cache/dashboard"

const DEFAULT_CONFIG = {
  "translations": [{ key: "en", messages: messages_en }, {key: "fr", messages: messages_fr}],
  "reducers": [{ key: "cache", reducer }],
  "core.Router": [
   { path: CACHING_DASHBOARD, component: CachesPage},
  ],
  "refs": [
    { key: "cache.cacheModelPicker", ref: CacheModelPicker },
  ]
}

export const CacheModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
}