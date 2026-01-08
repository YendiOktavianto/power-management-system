"use client";
import LeadershipCard from "./LeadershipCard";

type Member = { name: string; role: string; img: string };

export default function LeadershipGrid({ members }: { members: Member[] }) {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {members?.map((m, i) => (
        <LeadershipCard key={`${m.name}-${i}`} name={m.name} role={m.role} img={m.img} index={i} />
      ))}
    </div>
  );
}
