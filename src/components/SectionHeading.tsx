interface Props {
  eyebrow: string;
  title: string;
  note?: string;
  id?: string;
}

export default function SectionHeading({ eyebrow, title, note, id }: Props) {
  return (
    <div className="section-heading" id={id}>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {note && <span className="section-note">{note}</span>}
    </div>
  );
}
