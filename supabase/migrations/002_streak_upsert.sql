-- ============================================================
-- daily_streaks upsert function
-- Atomically increments the streak counters for today
-- ============================================================

CREATE OR REPLACE FUNCTION upsert_daily_streak(
  p_user_id UUID, p_correct BOOLEAN
) RETURNS VOID AS $$
BEGIN
  INSERT INTO daily_streaks (user_id, study_date, questions_answered, correct_answers)
  VALUES (p_user_id, CURRENT_DATE, 1, CASE WHEN p_correct THEN 1 ELSE 0 END)
  ON CONFLICT (user_id, study_date)
  DO UPDATE SET
    questions_answered = daily_streaks.questions_answered + 1,
    correct_answers = daily_streaks.correct_answers + CASE WHEN p_correct THEN 1 ELSE 0 END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
