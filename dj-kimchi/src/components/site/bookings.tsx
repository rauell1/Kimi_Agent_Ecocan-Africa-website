"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInView } from "@/hooks/use-in-view";
import { EVENT_TYPES, CONTACT_EMAIL } from "@/lib/site-data";

export function BookingsSection() {
  const { ref, inView } = useInView(0.1);
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    eventType: "",
    date: "",
    message: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: "Booking Submitted!",
          description: "DJ Kimchi's team will get back to you soon.",
        });
        setFormData({ name: "", email: "", eventType: "", date: "", message: "" });
      } else {
        toast({
          title: "Error",
          description: data.error || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to submit. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="bookings" className="relative py-24 sm:py-32">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/10 via-transparent to-transparent pointer-events-none" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-bold tracking-[0.3em] text-purple-400 uppercase mb-4 block">
            Let&apos;s Work Together
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
            Book <span className="gradient-text">DJ Kimchi</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Bring the Nairobi heat to your event. Clubs, festivals, private parties &amp; corporate nights across Kenya.
          </p>
          <div className="w-16 h-0.5 bg-gradient-to-r from-kenya-red via-purple-500 to-kenya-green mx-auto rounded-full mt-6" />
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">
          {/* Info side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-border">
              <h3 className="text-xl font-bold text-foreground mb-4">Available For</h3>
              <ul className="space-y-3">
                {EVENT_TYPES.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-foreground/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border">
              <h3 className="text-xl font-bold text-foreground mb-4">Why DJ Kimchi?</h3>
              <div className="space-y-4 text-sm text-foreground/70">
                <p>
                  Years of experience rocking Nairobi&apos;s top venues. Professionalism, versatility, and unmatched energy at every event.
                </p>
                <p>
                  Every set is tailored to your crowd. Dance floor stays packed from the first beat to the last.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
              <Calendar className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Limited Availability</p>
                <p className="text-xs text-foreground/60">Book early to secure your date</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
              <Send className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Direct Contact</p>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-xs text-purple-300 hover:text-foreground transition-colors"
                >
                  {CONTACT_EMAIL}
                </a>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <form
              onSubmit={handleSubmit}
              className="p-6 sm:p-8 rounded-2xl bg-card border border-border space-y-5"
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground/80 text-sm font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-background/70 border border-border text-foreground placeholder:text-muted-foreground focus:border-purple-500/50 focus:ring-purple-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground/80 text-sm font-medium">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-background/70 border border-border text-foreground placeholder:text-muted-foreground focus:border-purple-500/50 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="eventType" className="text-foreground/80 text-sm font-medium">
                    Event Type *
                  </Label>
                  <Select
                    value={formData.eventType}
                    onValueChange={(val) => setFormData({ ...formData, eventType: val })}
                  >
                    <SelectTrigger className="w-full bg-background/70 border border-border text-foreground focus:border-purple-500/50">
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border text-foreground">
                      <SelectItem value="club-night" className="text-foreground/80">Club Night</SelectItem>
                      <SelectItem value="private-party" className="text-foreground/80">Private Party</SelectItem>
                      <SelectItem value="festival" className="text-foreground/80">Festival / Concert</SelectItem>
                      <SelectItem value="corporate" className="text-foreground/80">Corporate Event</SelectItem>
                      <SelectItem value="wedding" className="text-foreground/80">Wedding</SelectItem>
                      <SelectItem value="other" className="text-foreground/80">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-foreground/80 text-sm font-medium">
                    Event Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-background/70 border border-border text-foreground focus:border-purple-500/50 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-foreground/80 text-sm font-medium">
                  Message
                </Label>
                <Textarea
                  id="message"
                  placeholder="Tell us about your event, venue, expected guests, etc."
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-background/70 border border-border text-foreground placeholder:text-muted-foreground focus:border-purple-500/50 focus:ring-purple-500/20 resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full py-6 bg-gradient-to-r from-kenya-red to-purple-600 text-white font-bold text-base rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed cta-primary"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Book DJ Kimchi for Your Event
                  </span>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
