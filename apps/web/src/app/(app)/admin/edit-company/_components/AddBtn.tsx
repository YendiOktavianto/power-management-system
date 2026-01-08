"use client";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";

export default function AddBtn({ onClick }: { onClick: () => void }) {
  return (
    <div>
    <Button
      label= "Add Label"
      leftIcon= {<Plus className="w-4 h-4" /> }
      variant="secondary"
      size = "sm"
      radius="xl"
      onClick={onClick}
    >
    </Button>
    </div>
  );
}
