// apps/web/src/app/(auth)/logout-overlay/type.ts

export type LogoutScope = "admin" | "user" | "all";

export type LogoutOverlayProps = {
  setSelectedPage: (page: string) => void;
  setShowLogoutOverlay: (show: boolean) => void;
};
