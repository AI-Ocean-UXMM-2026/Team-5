import { LinkButton } from "@/components/ui/Button";
import { Mascot } from "@/components/ui/Mascot";

const steps = [
  "Set a career goal and get an AI roadmap",
  "Learn with AI summaries and your own notes",
  "Pass the test and get certified",
  "Solve a real company challenge",
  "Interview and start your internship",
];

export default function Landing() {
  return (
    <div className="flex flex-col gap-16 py-4">
      <section className="grid items-center gap-10 md:grid-cols-[3fr_2fr]">
        <div>
          <p className="mb-3 text-body-sm font-semibold text-burgundy">For young people in Myanmar and the IT companies that hire them</p>
          <h1 className="text-h1 sm:text-display">Skills that get you in</h1>
          <p className="mt-4 max-w-xl text-body-lg text-muted">
            Follow a clear roadmap, learn IT skills, get certified, then prove yourself on a real challenge from a verified company. Coursera gives you a certificate. We give you an interview.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/signup">Create an account</LinkButton>
            <LinkButton href="/login" variant="secondary">
              Log in
            </LinkButton>
          </div>
        </div>
        <Mascot pose="journey" size={360} priority className="mx-auto w-60 sm:w-80 md:w-full md:max-w-[360px]" />
      </section>

      <section aria-labelledby="how" className="rounded-3xl border border-line bg-white p-6 sm:p-10">
        <h2 id="how" className="text-h3">
          How it works
        </h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, i) => (
            <li key={step} className="flex flex-col gap-2 border-t-2 border-yellow pt-4">
              <span className="font-heading text-h4 text-burgundy">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="flex items-center gap-5 rounded-2xl border border-line bg-white p-6">
          <Mascot pose="teach" size={112} />
          <div>
            <h2 className="text-h4">For learners</h2>
            <p className="mt-1 text-muted">Free to apply, take challenges and interview. Learn what companies actually need.</p>
          </div>
        </div>
        <div className="flex items-center gap-5 rounded-2xl border border-line bg-white p-6">
          <Mascot pose="search" size={112} />
          <div>
            <h2 className="text-h4">For companies</h2>
            <p className="mt-1 text-muted">Meet tested talent fast. You set the challenge, AI pre-screens, you decide.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
