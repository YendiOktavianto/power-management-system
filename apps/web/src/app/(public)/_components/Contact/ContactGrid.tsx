"use client";
import ContactCard from "./ContactCard";

type Person = { name: string; role: string; img: string; number: string };

export default function ContactGrid({ people }: { people: Person[] }) {
  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8">
      {people?.map((c, i) => (
        <ContactCard
          key={`${c.name}-${i}`}
          index={i}
          name={c.name}
          role={c.role}
          img={c.img}
          number={c.number}
        />
      ))}
    </div>
  );
}
