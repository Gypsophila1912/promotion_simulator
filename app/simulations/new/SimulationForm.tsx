"use client";

import { useState } from "react";
import { createSimulation } from "@/app/actions/simulations";
import type { SimulationFormData, AgeAllocation } from "@/lib/types/database";

export default function SimulationForm() {
  const [formData, setFormData] = useState<SimulationFormData>({
    company_name: "",
    industry: "",
    budget: 0,
    details: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 年代別配分の状態管理
  const [showAgeAllocation, setShowAgeAllocation] = useState(false);
  const [ageAllocation, setAgeAllocation] = useState<AgeAllocation>({
    "10代": 0,
    "20代": 0,
    "30代": 0,
    "40代": 0,
    "50代": 0,
    "60代以上": 0,
  });

  // 月別配分の状態管理
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

  // 年代別配分の合計を計算
  const getTotalAgeAllocation = () => {
    return Object.values(ageAllocation).reduce((sum, val) => sum + val, 0);
  };

  // 月のトグル
  const handleMonthToggle = (month: string) => {
    if (selectedMonths.includes(month)) {
      setSelectedMonths(selectedMonths.filter((m) => m !== month));
    } else {
      setSelectedMonths([...selectedMonths, month]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // 年代別配分が有効で、合計が予算と一致しない場合はエラー
    if (showAgeAllocation && getTotalAgeAllocation() > 0) {
      if (getTotalAgeAllocation() !== formData.budget) {
        setErrors({ age_allocation: "合計が予算と一致していません" });
        return;
      }
    }

    setLoading(true);

    // フォームデータに年代別配分と月別配分を追加
    const submissionData: SimulationFormData = {
      ...formData,
      age_allocation:
        showAgeAllocation && getTotalAgeAllocation() > 0
          ? ageAllocation
          : undefined,
      selected_months:
        selectedMonths.length > 0 ? selectedMonths : undefined,
    };

    const result = await createSimulation(submissionData);

    if (!result?.success && result?.errors) {
      setErrors(result.errors);
      setLoading(false);
    }
    // 成功時はredirectされるのでloading状態は解除不要
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow">
      {/* 一般エラーメッセージ */}
      {errors.submit && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{errors.submit}</p>
        </div>
      )}

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
          {errors.details && (
            <p className="mt-1 text-sm text-red-600">{errors.details}</p>
          )}
        </div>

        {/* 年代別予算配分セクション */}
        <div className="border-t pt-6">
          <div className="mb-4 flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              年代別予算配分（任意）
            </label>
            <button
              type="button"
              onClick={() => setShowAgeAllocation(!showAgeAllocation)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showAgeAllocation ? "閉じる" : "設定する"}
            </button>
          </div>

          {showAgeAllocation && (
            <div className="space-y-4 rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-600">
                各年代に配分する予算を入力してください。AIが自動で年代別の提案も生成します。
              </p>

              {/* 年代別入力フィールド */}
              {(
                ["10代", "20代", "30代", "40代", "50代", "60代以上"] as const
              ).map((age) => (
                <div key={age} className="flex items-center gap-4">
                  <label className="w-20 text-sm font-medium text-gray-700">
                    {age}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formData.budget}
                    value={ageAllocation[age] || ""}
                    onChange={(e) => {
                      const newAllocation = { ...ageAllocation };
                      newAllocation[age] = parseInt(e.target.value) || 0;
                      setAgeAllocation(newAllocation);
                    }}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                    placeholder="金額（円）"
                  />
                  <span className="text-sm text-gray-500">円</span>
                </div>
              ))}

              {/* 合計表示 */}
              <div className="flex items-center justify-between border-t pt-4">
                <span className="font-medium">合計</span>
                <span
                  className={`font-bold ${
                    getTotalAgeAllocation() === formData.budget
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {getTotalAgeAllocation().toLocaleString()}円 /{" "}
                  {formData.budget.toLocaleString()}円
                </span>
              </div>

              {getTotalAgeAllocation() !== formData.budget &&
                getTotalAgeAllocation() > 0 && (
                  <p className="text-sm text-red-600">
                    合計が予算と一致していません
                  </p>
                )}

              {errors.age_allocation && (
                <p className="text-sm text-red-600">{errors.age_allocation}</p>
              )}
            </div>
          )}
        </div>

        {/* 月別配分セクション */}
        <div className="border-t pt-6">
          <label className="mb-3 block text-sm font-medium text-gray-700">
            掲載月を選択（任意）
          </label>
          <p className="mb-4 text-sm text-gray-600">
            広告を掲載したい月を選択すると、AIが月ごとの最適な予算配分を提案します。
          </p>

          {/* 年ごとのカレンダーセクション */}
          {Array.from({ length: 5 }).map((_, yearIndex) => {
            const year = yearIndex + 1;
            const yearLabel = year === 1 ? "1年目" : `${year}年目`;
            return (
              <div key={year} className="mb-6">
                <h4 className="mb-3 text-sm font-semibold text-gray-700">
                  {yearLabel}
                </h4>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    "1月",
                    "2月",
                    "3月",
                    "4月",
                    "5月",
                    "6月",
                    "7月",
                    "8月",
                    "9月",
                    "10月",
                    "11月",
                    "12月",
                  ].map((month) => {
                    const monthKey = `${yearLabel}${month.replace('月', '')}月`;
                    return (
                      <label
                        key={monthKey}
                        className={`flex cursor-pointer items-center justify-center rounded border p-3 transition ${
                          selectedMonths.includes(monthKey)
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-gray-300 bg-white hover:border-blue-400"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedMonths.includes(monthKey)}
                          onChange={() => handleMonthToggle(monthKey)}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium">{month}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {selectedMonths.length > 0 && (
            <div className="mt-4 rounded-lg bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                選択: {selectedMonths.length}ヶ月（
                {selectedMonths.join("、")}）
              </p>
            </div>
          )}

          {errors.selected_months && (
            <p className="mt-2 text-sm text-red-600">
              {errors.selected_months}
            </p>
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
