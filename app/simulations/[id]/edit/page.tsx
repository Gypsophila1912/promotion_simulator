import { requireAuth } from "@/lib/auth/protected";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import SimulationEditForm from "./SimulationEditForm";

export default async function EditSimulationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: simulation, error } = await supabase
    .from("simulations")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !simulation) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">
        シミュレーション編集
      </h1>
      <SimulationEditForm simulation={simulation} />
    </main>
  );
}
