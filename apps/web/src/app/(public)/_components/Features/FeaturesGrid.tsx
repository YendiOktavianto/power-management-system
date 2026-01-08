"use client";
import FeatureItem from "./FeaturesItem";

type Feature = { title: string; desc: string; iconKey?: any };

type Props = {
  features: Feature[];
};

export default function FeaturesGrid({ features }: Props) {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {features?.map((f, i) => <FeatureItem key={i} item={f} index={i} />)}
    </div>
  );
}
