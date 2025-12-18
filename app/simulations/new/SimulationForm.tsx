"use client";

import { useState } from "react";
import { createSimulation } from "@/app/actions/simulations";
import type { SimulationFormData } from "@/lib/types/database";

export default function SimulationForm() {
  const [formData, setFormData] = useState<SimulationFormData>({
    company_name: "",
    industry: "",
    budget: 0,
    details: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const result = await createSimulation(formData);

    if (!result?.success && result?.errors) {
      setErrors(result.errors);
      setLoading(false);
    }
    // 成功時はredirectされるのでloading状態は解除不要
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow">
      <div className="space-y-6">
        <div>
          <label
            htmlFor="company_name"
            className="block text-sm font-medium text-gray-700"
          >
            会社名 <span className="text-red-500">*</span>
          </label>
          <input
            id="company_name"
            type="text"
            required
            value={formData.company_name}
            onChange={(e) =>
              setFormData({ ...formData, company_name: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="例: テストカフェ"
          />
          {errors.company_name && (
            <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="industry"
            className="block text-sm font-medium text-gray-700"
          >
            投資カテゴリー <span className="text-red-500">*</span>
          </label>
          <input
            id="industry"
            type="text"
            required
            value={formData.industry}
            onChange={(e) =>
              setFormData({ ...formData, industry: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="例: SNS広告、YouTube広告"
          />
          {errors.industry && (
            <p className="mt-1 text-sm text-red-600">{errors.industry}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="budget"
            className="block text-sm font-medium text-gray-700"
          >
            予算（円） <span className="text-red-500">*</span>
          </label>
          <input
            id="budget"
            type="number"
            required
            min="1"
            value={formData.budget || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                budget: parseInt(e.target.value) || 0,
              })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="例: 100000"
          />
          {errors.budget && (
            <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="details"
            className="block text-sm font-medium text-gray-700"
          >
            悩みや相談内容（任意）
          </label>
          <textarea
            id="details"
            value={formData.details}
            onChange={(e) =>
              setFormData({ ...formData, details: e.target.value })
            }
            rows={6}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="例: 若年層に認知を広めたい。動画広告に興味あり。"
          />
          <p className="mt-1 text-sm text-gray-500">
            将来のAI分析で使用されます（現在は保存のみ）
          </p>
          {errors.details && (
            <p className="mt-1 text-sm text-red-600">{errors.details}</p>
          )}
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "作成中..." : "作成する"}
        </button>
        <a
          href="/simulations"
          className="flex-1 rounded-md bg-gray-200 px-4 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-300"
        >
          キャンセル
        </a>
      </div>
    </form>
  );
}
