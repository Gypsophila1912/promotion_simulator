import { requireAuth } from "@/lib/auth/protected";
import SimulationForm from "./SimulationForm";

export default async function NewSimulationPage() {
  await requireAuth();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">
        新規シミュレーション作成
      </h1>
      <SimulationForm />
    </main>
  );
}
