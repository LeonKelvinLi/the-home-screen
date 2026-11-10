import { AsyncLocalStorage } from "node:async_hooks";
export const requestContext = new AsyncLocalStorage<{
  basePath: string;
  identity?: { memberId: string; name: string; email: string | null };
}>();
export function publicPath(path: string) {
  return (requestContext.getStore()?.basePath || "") + path;
}
