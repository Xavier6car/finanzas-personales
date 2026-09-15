"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface UserOption {
  id: string;
  name: string;
  color: string;
}

export function PersonSelector({ current, users }: { current: string; users: UserOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function apply(personId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (personId === "all") params.delete("person");
    else params.set("person", personId);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => apply("all")}
        className={`btn ${current === "all" ? "btn-primary" : "btn-secondary"} !py-1.5 !text-xs`}
      >
        Todos
      </button>
      {users.map((u) => (
        <button
          key={u.id}
          onClick={() => apply(u.id)}
          className={`btn !py-1.5 !text-xs ${current === u.id ? "" : "btn-secondary"}`}
          style={
            current === u.id
              ? { background: u.color, borderColor: u.color, color: "#fff" }
              : undefined
          }
        >
          {u.name}
        </button>
      ))}
    </div>
  );
}
