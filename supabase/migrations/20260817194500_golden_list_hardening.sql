create index if not exists newsletter_deliveries_subscriber_idx
  on public.newsletter_deliveries(subscriber_id);

revoke execute on function public.subscribe_newsletter(text, text, text) from authenticated;
revoke execute on function public.unsubscribe_newsletter(uuid) from authenticated;

