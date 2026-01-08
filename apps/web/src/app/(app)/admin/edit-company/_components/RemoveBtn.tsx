"use client";
import { Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";

export default function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <div>
      <Button
        label= "Delete"
        leftIcon= {<Trash2 className="w-4 h-4" /> }
        variant="delete"
        align="center"
        size = "sm"
        radius="xl"
        onClick={onClick}
      >
      </Button>
    </div>
  );
}
