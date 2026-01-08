"use client";

import { FC } from "react";
import useLogout from "@/app/(app)/dashboard/logout/useLogout";
import type { LogoutOverlayProps } from "./types";
import { COPY } from "./constants";

import ModalPortal from "@/components/common/ModalPortal";
import LogoutIllustration from "@/components/features/logout/LogoutIllustration";
import Message from "@/components/features/logout/Message";
import Buttons from "@/components/features/logout/Buttons";

const LogoutOverlay: FC<LogoutOverlayProps> = ({
  setSelectedPage,
  setShowLogoutOverlay,
}) => {
  const { doLogout } = useLogout();

  const handleClose = () => setShowLogoutOverlay(false);

  return (
    <ModalPortal open onClose={handleClose}>
      <LogoutIllustration />
      <Message text={COPY.message} />
      <Buttons
        cancelLabel={COPY.cancel}
        confirmLabel={COPY.confirm}
        onCancel={handleClose}
        onConfirm={() =>
          doLogout({ setShowLogoutOverlay, setSelectedPage })
        }
      />
    </ModalPortal>
  );
};

export default LogoutOverlay;
