import { toast } from "react-hot-toast";

// ==============================
// 🎨 CONFIG BASE (CENTRADO REAL)
// ==============================
const baseStyle = {
  borderRadius: "12px",
  color: "#fff",
  padding: "16px",
  textAlign: "center" as const,
  minWidth: "280px",
};

// ==============================
// ✅ ÉXITO
// ==============================
export const toastSuccess = (msg: string) => {
  toast.success(msg, {
    position: "top-center",
    style: {
      ...baseStyle,
      background: "#16a34a",
      fontWeight: "600",
    },
  });
};

// ==============================
// ❌ ERROR
// ==============================
export const toastError = (msg: string) => {
  toast.error(msg, {
    position: "top-center",
    style: {
      ...baseStyle,
      background: "#dc2626",
    },
  });
};

// ==============================
// ⚠️ INFO
// ==============================
export const toastInfo = (msg: string) => {
  toast(msg, {
    position: "top-center",
    style: {
      ...baseStyle,
      background: "#374151",
    },
  });
};

// ==============================
// 🔥 CONFIRMACIÓN REUTILIZABLE PRO
// ==============================
type ConfirmOptions = {
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "success" | "warning";
};

export const toastConfirm = ({
  message,
  onConfirm,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "danger",
}: ConfirmOptions) => {
  const bgColor =
    type === "danger"
      ? "bg-red-600"
      : type === "success"
      ? "bg-green-600"
      : "bg-yellow-500";

  toast(
    (t) => (
      <div className="flex flex-col items-center gap-3 text-center">

        {/* MENSAJE */}
        <span className="font-semibold text-sm">{message}</span>

        {/* BOTONES */}
        <div className="flex gap-3 justify-center w-full">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-1.5 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
          >
            {cancelText}
          </button>

          <button
            onClick={() => {
              onConfirm();
              toast.dismiss(t.id);
            }}
            className={`px-4 py-1.5 text-white rounded-lg hover:opacity-90 transition ${bgColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    ),
    {
      duration: 5000,
      position: "top-center",
      style: {
        ...baseStyle,
        background: "#1f2937", // gris oscuro elegante
      },
    }
  );
};