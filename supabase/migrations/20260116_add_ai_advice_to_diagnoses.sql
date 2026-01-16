-- ad_diagnosesテーブルにai_adviceカラムを追加
ALTER TABLE ad_diagnoses
ADD COLUMN IF NOT EXISTS ai_advice TEXT;

-- UPDATEポリシーを追加（AI分析結果を保存するために必要）
DROP POLICY IF EXISTS "Users can update own diagnoses" ON ad_diagnoses;
CREATE POLICY "Users can update own diagnoses"
ON ad_diagnoses
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
