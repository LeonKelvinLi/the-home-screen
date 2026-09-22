/*
  OPEN MODE: /crm with no key, everyone acting as Glenn, for looking at the
  screen on a laptop. Asked for with CRM_OPEN=1 and honoured only outside
  production, so a live deploy keeps its lock whatever the environment says.
  No imports on purpose: the rule can be checked without a database.
*/
export const crmOpenMode = (env: Record<string, string | undefined>, prod: boolean) => env.CRM_OPEN === '1' && !prod
