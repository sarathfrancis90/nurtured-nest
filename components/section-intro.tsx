export function SectionIntro({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 className="section-header">{title}</h1>
      <p>{description}</p>
    </div>
  );
}
