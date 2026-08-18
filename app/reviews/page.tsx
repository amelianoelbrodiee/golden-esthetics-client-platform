import type { Metadata } from "next";
import { Testimonials } from "../components/Testimonials";

export const metadata: Metadata = {
  title: "Reviews",
  description: "Real words from real Golden Esthetics clients. Read reviews and share your own.",
};

export const dynamic = "force-dynamic";

export default function Page() {
  return <Testimonials />;
}
