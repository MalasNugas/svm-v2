import { AppShell } from "@/components/AppShell";
import digital from "@/assets/about-digital.jpg";
import researcher from "@/assets/researcher.jpg";

export default function About() {
  return (
    <AppShell searchPlaceholder="About the project...">
      <section className="max-w-[1200px]">
        <p className="text-secondary text-[11px] tracking-[0.25em] uppercase font-bold">Academic Thesis 2024</p>
        <h1 className="mt-4 font-headline text-5xl md:text-6xl font-extrabold text-primary tracking-tight leading-[1.05]">
          Social Media <span className="text-secondary">Sentiment Analysis</span> of Flores Tourism
        </h1>
        <p className="mt-5 text-muted-foreground text-lg max-w-2xl">
          Decoding the digital <i>heartbeat</i> of East Nusa Tenggara through advanced natural language processing and Support Vector Machine classification.
        </p>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface-lowest rounded-2xl p-8 shadow-ambient relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary-container/40 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary-container/60 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined">monitoring</span>
                </div>
                <h3 className="font-headline text-2xl font-bold text-primary">The Problem</h3>
              </div>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                Despite its breathtaking landscapes, Flores faces challenges in tracking tourist satisfaction in real-time. Traditional surveys are slow, expensive, and often suffer from retrospective bias.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                The sheer volume of social media data remains an untapped goldmine. Without automated sentiment analysis, tourism stakeholders are "flying blind," unable to respond swiftly to emerging concerns or capitalize on trending positive experiences.
              </p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden relative min-h-[300px]">
            <img src={digital} alt="Digital transformation" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/95 to-primary/20" />
            <div className="relative h-full flex flex-col justify-end p-8 text-primary-foreground">
              <h4 className="font-headline text-2xl font-bold">Digital Transformation</h4>
              <p className="text-sm mt-2 text-primary-foreground/85">Mapping emotional geography across the archipelago.</p>
            </div>
          </div>
        </div>

        {/* Method */}
        <div className="mt-8 bg-surface-low rounded-2xl p-8 border-l-4 border-secondary">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <h3 className="font-headline text-3xl font-bold text-primary leading-tight">The Method: Support Vector Machine (SVM)</h3>
              <p className="mt-5 text-muted-foreground leading-relaxed">
                Support Vector Machine (SVM) was selected for its high performance in high-dimensional text spaces. Our model utilizes a radial basis function (RBF) kernel to classify tweets, reviews, and posts into three distinct polarities.
              </p>
              <ul className="mt-6 space-y-3">
                {["Lexicon-Based Pre-processing", "Hyperplane Optimization", "K-Fold Cross Validation (K=10)"].map((s) => (
                  <li key={s} className="flex items-center gap-3 text-primary font-medium">
                    <span className="w-2 h-2 rounded-full bg-secondary" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-surface-lowest rounded-2xl p-8 shadow-ambient flex flex-col items-center gap-3">
              {[
                { l: "Data Crawling", primary: true },
                { l: "Pre-processing", primary: true },
              ].map((s) => (
                <div key={s.l} className="w-full max-w-xs">
                  <div className="bg-primary-fixed text-primary text-center py-3 rounded-xl text-[11px] font-bold tracking-[0.18em] uppercase">{s.l}</div>
                  <div className="flex justify-center text-muted-foreground my-1"><span className="material-symbols-outlined">arrow_downward</span></div>
                </div>
              ))}
              <div className="w-full max-w-xs grid grid-cols-2 gap-3">
                <div className="bg-secondary-container/60 text-secondary text-center py-3 rounded-xl text-[11px] font-bold tracking-[0.18em] uppercase">SVM Training</div>
                <div className="bg-secondary-container/60 text-secondary text-center py-3 rounded-xl text-[11px] font-bold tracking-[0.18em] uppercase">SVM Testing</div>
              </div>
              <div className="text-muted-foreground my-1"><span className="material-symbols-outlined">arrow_downward</span></div>
              <div className="w-full max-w-xs gradient-primary text-primary-foreground text-center py-3 rounded-xl text-[11px] font-bold tracking-[0.18em] uppercase">Sentiment Prediction</div>
            </div>
          </div>
        </div>

        {/* Researcher */}
        <div className="mt-8 bg-surface-lowest rounded-2xl p-8 shadow-ambient grid grid-cols-1 md:grid-cols-[200px,1fr] gap-8 items-center">
          <div className="relative">
            <div className="w-44 h-44 rounded-2xl overflow-hidden border-4 border-secondary-container">
              <img src={researcher} alt="Researcher" loading="lazy" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground shadow-ambient">
              <span className="material-symbols-outlined">school</span>
            </div>
          </div>
          <div>
            <p className="text-secondary text-[11px] tracking-[0.2em] uppercase font-bold">About the Researcher</p>
            <h3 className="font-headline text-3xl font-bold text-primary mt-2">Aditya Wijaya, M.Kom</h3>
            <p className="mt-3 text-muted-foreground leading-relaxed max-w-2xl">
              Specializing in Computational Linguistics and Tourism Analytics. This thesis aims to provide the Flores Tourism Bureau with an automated decision-support system to maintain the region's status as a world-class destination.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button className="px-5 py-2.5 rounded-xl border border-border/40 text-primary font-bold text-sm hover:bg-surface-low">Contact Researcher</button>
              <button className="px-5 py-2.5 rounded-xl border border-border/40 text-primary font-bold text-sm hover:bg-surface-low">View Publications</button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/30 text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
          <p className="font-bold text-primary">Faculty of Computer Science</p>
          <p className="mt-1">University of Tourism &amp; Information Technology</p>
        </div>
      </section>
    </AppShell>
  );
}
