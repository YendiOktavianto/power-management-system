"use client";

import React from "react";
import { useUserManagement } from "./useUserManagement";

import HeaderBar from "./_components/HeaderBar";
import Controls from "./_components/Controls";
import UsersTable from "./_components/Table";
import PaginationBar from "@/components/ui/Pagination";
import AddUserModal from "./_components/AddUserModal";
import EditUserModal from "./_components/EditUserModal";
import ConfirmDeleteModal from "./_components/ConfirmDeleteModal";
import AppPageShell from "@/components/ui/AppPageShell";
import ModalPortal from "@/components/common/ModalPortal";

export default function DataTable(): React.JSX.Element {
  const {
    // state & setter
    search, setSearch,
    show, setShow,
    currentPage, setCurrentPage,
    filterDate, setFilterDate,
    timeFrom, setTimeFrom,
    timeTo, setTimeTo,

    // modal/draft
    confirmDelete, setConfirmDelete,
    addUserModal, setAddUserModal,
    newUser, setNewUser,
    editRow, setEditRow,
    editModal, setEditModal,
    editDraft, setEditDraft,

    // status
    submittingAdd, submittingEdit, apiError,
    formErrors,

    // derived
    paginatedData,
    totalPages,

    // actions
    handleDelete,
    handleAddUser,
    openEdit,
    handleSaveEdit,
    exportXLS,
    openPicker,
  } = useUserManagement();

    const anyModalOpen =
    addUserModal ||
    (!!editModal && !!editRow && !!editDraft) ||
    !!confirmDelete;

  const handleClosePortal = () => {
    if (addUserModal) {
      setAddUserModal(false);
    }
    if (editModal) {
      setEditModal(false);
      setEditRow(null);
      setEditDraft(null);
    }
    if (confirmDelete) {
      setConfirmDelete(null);
    }
  };

  return (
    <AppPageShell>
      <HeaderBar onAdd={() => setAddUserModal(true)} onExport={exportXLS} />

      {/* FILTER & CONTROL */}
      <Controls
        show={show} setShow={setShow}
        search={search} setSearch={setSearch}
        filterDate={filterDate} setFilterDate={setFilterDate}
        timeFrom={timeFrom} setTimeFrom={setTimeFrom}
        timeTo={timeTo} setTimeTo={setTimeTo}
        openPicker={openPicker}
      />

      {/* TABLE */}
      <UsersTable rows={paginatedData as any} onEdit={openEdit} onAskDelete={setConfirmDelete as any} />

      {/* PAGINATION */}
      <PaginationBar show={show} currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />

      {/* MODAL ADD USER */}
      <ModalPortal open={anyModalOpen} onClose={handleClosePortal}>
        <AddUserModal
          open={addUserModal}
          onClose={() => setAddUserModal(false)}
          apiError={apiError}
          formErrors={formErrors}
          newUser={newUser}
          setNewUser={setNewUser}
          submitting={submittingAdd}
          onSubmit={handleAddUser}
        />

        {/* MODAL EDIT USER */}
        <EditUserModal
          open={!!(editModal && editRow && editDraft)}
          apiError={apiError}
          editRow={editRow}
          editDraft={editDraft}
          setEditDraft={setEditDraft}
          submitting={submittingEdit}
          onSave={handleSaveEdit}
          onCancel={() => {
            setEditModal(false);
            setEditRow(null);
            setEditDraft(null);
          }}
        />

        {/* CONFIRM DELETE */}
        <ConfirmDeleteModal
          open={!!confirmDelete}
          username={confirmDelete?.username}
          onCancel={() => setConfirmDelete(null)}
          onDelete={() => {
            if (confirmDelete) handleDelete(confirmDelete);
          }}
        />
      </ModalPortal>
    </AppPageShell>
  );
}
