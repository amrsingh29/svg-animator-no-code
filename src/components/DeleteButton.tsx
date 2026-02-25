"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteButton({ id }: { id: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent Link navigation
        e.stopPropagation(); // Stop event bubbling

        if (!confirm("Are you sure you want to delete this?")) {
            return;
        }

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/gallery/delete?id=${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                router.refresh(); // Refresh the page to show updated list
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete");
            }
        } catch (err) {
            console.error(err);
            alert("Error deleting item");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
                background: 'none',
                border: 'none',
                color: isDeleting ? '#71717a' : '#ef4444',
                cursor: isDeleting ? 'default' : 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'background 0.2s'
            }}
            title="Delete"
        >
            <Trash2 size={16} />
        </button>
    );
}
