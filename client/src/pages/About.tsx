import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";
import { useLocation } from "wouter";

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation('/')}
          className="gap-1 mb-8 -ml-2"
          data-testid="button-back-home"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="space-y-12">
          <div className="space-y-4" data-testid="about-eremos">
            <h1 className="text-4xl font-serif text-primary">Eremos</h1>
            <p className="text-sm text-muted-foreground/60 tracking-widest uppercase">
              ἔρημος · erēmos
            </p>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>
                The Greek word <em>eremos</em> (ἔρημος) means a desolate, solitary, or wilderness place. In the Gospels, it describes the deserted places where Jesus regularly withdrew to pray — away from crowds, noise, and demand.
              </p>
              <p>
                "Very early in the morning, while it was still dark, Jesus got up, left the house and went off to a solitary place, where he prayed." <span className="text-xs text-primary/50">— Mark 1:35</span>
              </p>
              <p>
                This app is your eremos — a quiet digital space for daily scripture, honest self-examination, and unhurried prayer, structured around the practices of the Desert Fathers.
              </p>
            </div>
          </div>

          <div className="border-t border-border/30 pt-8 space-y-4" data-testid="about-desert-fathers">
            <h2 className="text-2xl font-serif text-primary">The Desert Tradition</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>
                In the 3rd and 4th centuries, men and women fled to the Egyptian and Syrian deserts seeking God in radical simplicity. These Desert Fathers and Mothers — figures like Anthony the Great, Evagrius Ponticus, John Cassian, and the Abbas and Ammas of the <em>Apophthegmata Patrum</em> — developed practices of prayer, self-knowledge, and interior stillness that remain profoundly relevant today.
              </p>
              <p>
                Eremos draws on their wisdom to structure each daily session around four movements: reading, meditation, examination, and prayer.
              </p>
            </div>
          </div>

          <div className="border-t border-border/30 pt-8 space-y-6" data-testid="about-terms">
            <h2 className="text-2xl font-serif text-primary">Key Terms</h2>

            <div className="space-y-2">
              <h3 className="font-serif text-lg text-foreground">Lectio Divina</h3>
              <p className="text-sm text-muted-foreground/60 tracking-wide italic">Latin: "divine reading"</p>
              <p className="text-muted-foreground leading-relaxed">
                A slow, prayerful way of reading Scripture — not to study or analyze, but to listen. You read a passage, sit with what stands out, and let God speak through the words. It's less about covering ground and more about being present to what's there.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-lg text-foreground">Meletê</h3>
              <p className="text-sm text-muted-foreground/60 tracking-wide italic">Greek: μελέτη · "meditation" or "rumination"</p>
              <p className="text-muted-foreground leading-relaxed">
                The Desert Fathers' word for meditation. Not emptying the mind, but chewing on Scripture — turning a phrase over and over in your heart until it shapes you. Like a cow chewing cud, you return to the same words again and again, letting them work on you from the inside.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-lg text-foreground">Logismoi</h3>
              <p className="text-sm text-muted-foreground/60 tracking-wide italic">Greek: λογισμοί · "thoughts" or "thought-patterns"</p>
              <p className="text-muted-foreground leading-relaxed">
                Evagrius Ponticus identified eight recurring thought-patterns that pull us away from God — things like anger, greed, pride, lust, and restlessness. The practice isn't to suppress thoughts but to notice them honestly: where did this come from? What does it promise? Did I consent to it? This kind of interior awareness is the heart of desert self-examination.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-lg text-foreground">Acedia</h3>
              <p className="text-sm text-muted-foreground/60 tracking-wide italic">Greek: ἀκηδία · "listlessness" or "spiritual boredom"</p>
              <p className="text-muted-foreground leading-relaxed">
                Sometimes called "the noonday demon," acedia is the restless feeling that makes you want to abandon your prayer, check your phone, or be anywhere but here. The Desert Fathers considered it one of the most dangerous temptations because it attacks the will to persist. Recognizing it is the first step to resisting it.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-lg text-foreground">Consolation &amp; Desolation</h3>
              <p className="text-sm text-muted-foreground/60 tracking-wide italic">From the Ignatian tradition</p>
              <p className="text-muted-foreground leading-relaxed">
                The mood slider in Eremos asks you to name your inner state on a scale from desolation to consolation. Desolation isn't just sadness — it's a felt distance from God, a heaviness or dryness. Consolation is the opposite — a sense of being drawn closer, of peace and trust. Neither state is permanent, and simply naming where you are is an act of honesty before God.
              </p>
            </div>
          </div>

          <div className="border-t border-border/30 pt-8 space-y-4" data-testid="about-bible">
            <h2 className="text-2xl font-serif text-primary">Bible Translation</h2>
            <p className="text-muted-foreground leading-relaxed">
              Eremos uses the <strong>Berean Standard Bible (BSB)</strong>, a modern English translation that balances accuracy with readability. The BSB is freely available for use in digital applications.
            </p>
          </div>

          <div className="border-t border-border/30 pt-8 space-y-4" data-testid="about-support">
            <h2 className="text-2xl font-serif text-primary">Support This Ministry</h2>
            <p className="text-muted-foreground leading-relaxed">
              Eremos is free to use. If it blesses your prayer life and you'd like to help keep it running, you can support the project through PayPal.
            </p>
            <a
              href="https://paypal.me/BenjaminVanScyoc"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              data-testid="link-about-donate"
            >
              <Heart className="w-4 h-4" />
              paypal.me/BenjaminVanScyoc
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
