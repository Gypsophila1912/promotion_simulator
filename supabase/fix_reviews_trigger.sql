-- reviews テーブルのトリガーを修正

-- 1. 誤ったトリガーを削除
drop trigger if exists set_reviews_updated_at on public.simulations;

-- 2. 正しいトリガーを作成
create trigger set_reviews_updated_at
  before update on public.reviews
  for each row
  execute function public.handle_updated_at();
