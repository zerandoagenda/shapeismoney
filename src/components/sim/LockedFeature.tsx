import { LockKeyhole } from "lucide-react";

export function LockedFeature({ title, description }: { title: string; description: string }) {
  return <section className="border-y border-border py-16 text-center"><LockKeyhole className="mx-auto size-5 text-primary"/><p className="sim-kicker mt-5">Acesso reservado</p><h2 className="mt-4 text-4xl">{title}</h2><p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-muted-foreground">{description}</p></section>;
}