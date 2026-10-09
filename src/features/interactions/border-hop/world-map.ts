import atlas from "world-atlas/countries-110m.json";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import { countryAliases } from "./border-hop-rules";

const topology = atlas as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
export const worldCountries = feature(topology, topology.objects.countries).features
  .filter((country) => country.properties.name !== "Antarctica")
  .map((country) => ({
    ...country,
    properties: { name: countryAliases[country.properties.name] ?? country.properties.name },
  }));
export const countryNames = worldCountries.map((country) => country.properties.name).sort();
