"use client";

import { deleteSimulation } from "@/app/actions/simulations";
import { useState } from "react";

export default function DeleteButton({
  simulationId,
}: {
  simulationId: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("本当に削除しますか？この操作は取り消せません。")) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteSimulation(simulationId);

    // Server Actionは例外を投げずに結果オブジェクトを返す
    if (result && !result.success) {
      console.error("削除エラー:", result.errors);
      alert(result.errors?.submit || "削除に失敗しました");
      setIsDeleting(false);
    }
    // 成功時はredirectされるのでloading状態は解除不要
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
    >
      {isDeleting ? "削除中..." : "削除"}
    </button>
  );
}
