import { router } from "expo-router";

export const openSearchModal = (params: Record<string, any> = {}) => {
  router.push({
    pathname: '/search-modal',
    params
  });
};
