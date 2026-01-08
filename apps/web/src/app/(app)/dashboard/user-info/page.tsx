"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import useUserInfo from "./useUserInfo";
import type { Point, Area } from "./types";
import {subtitle} from "./constants";
import {BTN} from "@/components/ui/theme"
import ModalPortal from "@/components/common/ModalPortal";
import ProfileCard from "./_components/ProfileCard";
import AccountSection from "./_components/AccountSection";
import DevicesSection from "./_components/DevicesSection";
import AvatarEditor from "./_components/AvatarEditor";
import PhoneEditor from "./_components/PhoneEditor";
import PasswordEditor from "./_components/PasswordEditor";
import useToast from "@/components/common/hooks/useToastMessage";
import ToastInline from "@/components/common/ToastMessageInline";
import AppPageShell from "@/components/ui/AppPageShell";
import PageHeader from "@/components/ui/PageHeader";
import SubmitButton from "@/components/ui/Button";

export default function UserInfoContent() {
  const router = useRouter();
    const toastApi = useToast();
    const lastToastId = useRef<number>(0);

  const {
    info, editing, setEditing, form, setForm, errors, 
    crop, setCrop, zoom, setZoom, setCroppedAreaPixels, 
    fileUrl, setFileUrl, showPW, setShowPW, handleEdit, 
    handleSave, templates, saving, toastEvent,
  } = useUserInfo();

  const canShowSensitive = !!info?.username && !!info?.email;

  const [avatarTab, setAvatarTab] = useState<"upload" | "template">("upload");
  const [groupFilter, setGroupFilter] = useState<"all" | "profile" | "profile2">("all");
  const filteredTemplates = useMemo(
    () => templates.filter((t) => groupFilter === "all" || t.group === groupFilter),
    [templates, groupFilter]
  );

  useEffect(() => {
    if (!toastEvent?.type || !toastEvent?.text) return;
    if (lastToastId.current === toastEvent.id) return;
    lastToastId.current = toastEvent.id;

    if (toastEvent.type === "success") toastApi.success(toastEvent.text);
    else if (toastEvent.type === "error") toastApi.error(toastEvent.text);
    else if (toastEvent.type === "danger") toastApi.danger(toastEvent.text);
    else toastApi.info(toastEvent.text);
  }, [toastEvent, toastApi]);


  return (
    <AppPageShell>
      <PageHeader 
        title="User Info"
        subtitle={subtitle}
        align="left"
      />

      <div className="grid grid-cols-12 gap-3 sm:gap-4 items-start mt-4 max-w-6xl w-full mx-auto">
        <aside className="col-span-12 md:col-span-4">
          <ProfileCard
            avatar={info.avatar}
            username={info.username}
            email={info.email}
            onChangePhoto={() => {
              setAvatarTab("upload");
              setGroupFilter("all");
              handleEdit("avatar");
            }}
            btnSecondaryClass={BTN.secondary}
          />
        </aside>

        <main className="col-span-12 md:col-span-8 space-y-3">
          <AccountSection info={info} onEdit={handleEdit} canShowSensitive={canShowSensitive}/>
          <DevicesSection onAddDevice={() => router.push("/dashboard/user-info/add-device")} />
        </main>
      </div>

      <ModalPortal open={Boolean(editing)} onClose={() => setEditing(null)}>
        <h3 className="text-lg font-bold mb-4 text-center">
          {editing === "avatar" ? "Edit Profile Picture" : editing === "phone" ? "Edit Phone Number" : "Change Password"}
        </h3>

        {editing === "avatar" && (
          <AvatarEditor
            avatarTab={avatarTab}
            setAvatarTab={setAvatarTab}
            groupFilter={groupFilter}
            setGroupFilter={setGroupFilter}
            filteredTemplates={filteredTemplates}
            infoAvatar={info.avatar}
            fileUrl={fileUrl}
            setFileUrl={setFileUrl}
            form={form}
            setForm={setForm}
            crop={crop as Point}
            setCrop={setCrop}
            zoom={zoom}
            setZoom={setZoom}
            setCroppedAreaPixels={(a) => setCroppedAreaPixels(a as Area)}
          />
        )}

        {editing === "phone" && (
          <PhoneEditor form={form} setForm={setForm} errors={errors} />
        )}

        {editing === "password" && (
          <PasswordEditor
            form={form}
            setForm={setForm}
            errors={errors}
            showPW={showPW}
            setShowPW={setShowPW}
          />
        )}

        <div className="flex gap-2 mt-8 ml-50">
          <SubmitButton 
            label="Cancel" 
            onClick={() => setEditing(null)} 
            size="sm" 
            variant="secondary" 
            radius="lg">            
          </SubmitButton>
          <SubmitButton 
            label={saving ? "Saving..." : "Save"} 
            onClick={handleSave}  
            disabled={saving} 
            size="sm" 
            variant="primary" 
            radius="lg">
          </SubmitButton>
        </div>
      </ModalPortal>

      
      <ToastInline
        toast={toastApi.toast}
        onClose={toastApi.close}
        placement="top-center"
        aria-live="polite"
      />
    </AppPageShell>
  );
}
