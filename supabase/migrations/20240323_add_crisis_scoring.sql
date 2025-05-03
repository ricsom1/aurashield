-- Add function to calculate crisis score
create or replace function calculate_crisis_score(
  p_text text,
  p_sentiment numeric,
  p_length integer
) returns integer as $$
begin
  return (
    case when p_sentiment < 0 then 50 else 0 end +
    case when p_length > 100 then 30 else 0 end +
    case when p_text ~* 'scandal|controversy|outrage|backlash|criticism' then 20 else 0 end
  );
end;
$$ language plpgsql security definer;

-- Add trigger to automatically calculate crisis score
create or replace function update_crisis_score()
returns trigger as $$
begin
  new.crisis_score := calculate_crisis_score(
    new.text,
    new.sentiment,
    length(new.text)
  );
  new.is_crisis := new.crisis_score >= 70;
  return new;
end;
$$ language plpgsql;

create trigger mentions_crisis_score_trigger
  before insert or update on mentions
  for each row
  execute function update_crisis_score(); 