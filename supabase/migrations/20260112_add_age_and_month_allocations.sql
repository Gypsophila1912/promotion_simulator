-- 年代別予算配分を保存
ALTER TABLE simulations
ADD COLUMN age_allocation JSONB DEFAULT NULL;

-- 月別予算配分を保存
ALTER TABLE simulations
ADD COLUMN month_allocation JSONB DEFAULT NULL;

-- 選択された掲載月を保存
ALTER TABLE simulations
ADD COLUMN selected_months TEXT[] DEFAULT NULL;

-- コメント追加
COMMENT ON COLUMN simulations.age_allocation IS '年代別予算配分 (例: {"10代": 15000, "20代": 25000, ...})';
COMMENT ON COLUMN simulations.month_allocation IS '月別予算配分 (例: {"1月": 50000, "2月": 30000, ...})';
COMMENT ON COLUMN simulations.selected_months IS 'ユーザーが選択した掲載月の配列 (例: ["1月", "3月", "12月"])';
