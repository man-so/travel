import { CountryStamp } from '@/components/passport/CountryStamp';
import type { PassportCountry } from '@/types/passport';

export function StampGrid({
  countries,
  onOpenCountry,
}: {
  countries: PassportCountry[];
  onOpenCountry: (country: PassportCountry) => void;
}) {
  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {countries.map((country) => (
        <CountryStamp
          country={country}
          key={country.country}
          onOpenMap={() => onOpenCountry(country)}
        />
      ))}
    </section>
  );
}
